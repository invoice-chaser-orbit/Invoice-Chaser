// Provider boundary. This is the ONLY file that imports the Gemini SDK — see CLAUDE.md
// "Provider abstraction". Agent code calls generateWithTools()/generateDecision() and never
// sees a Gemini-specific type. Swapping providers later is a one-file change.

import { GoogleGenerativeAI, SchemaType, type Content, type Part } from "@google/generative-ai";

const MODEL = "gemini-3.1-flash-lite"; // function-calling capable — verified live via a real
// generateContent call (with functionDeclarations, returned a genuine functionCall part plus
// thoughtSignature) against this project's key on 2026-07-27. Re-tested the "lite" tier same day
// after the AI Studio rate-limit dashboard showed it has by far the best free-tier quota (500
// requests/day, 15 RPM, 250K TPM) versus every non-lite model capped at 20 requests/day — and
// gemini-3-flash-preview (this project's previous model) had already peaked at 22/20 that day.
// gemini-3.5-flash-lite and gemini-2.5-flash-lite still hang to timeout; gemini-3.1-flash-lite
// specifically no longer does — the earlier "whole lite tier is broken" conclusion doesn't hold
// for this model as of today. If it starts hanging again, gemini-3-flash-preview is the known-
// working fallback (see git history), accepting its 20/day ceiling. gemini-2.5-flash/
// gemini-2.0-flash are unavailable/zero-quota for this project; the "gemini-flash-latest" alias
// silently resolves server-side to gemini-3.6-flash (also capped at 20/day) — use concrete
// (non-alias) model names only. See workplan Day 0 risk register on stale model names / rate
// limits.

// --- Provider-agnostic tool schema -----------------------------------------------------
// Plain JSON-Schema-shaped, deliberately NOT Gemini's SchemaType enum, so agent/tools.ts
// never has to import anything Gemini-specific either.

export type JsonSchemaType = "string" | "number" | "boolean" | "object" | "array";

export interface ToolParamSchema {
  type: JsonSchemaType;
  description?: string;
  enum?: string[];
  items?: ToolParamSchema;
  properties?: Record<string, ToolParamSchema>;
  required?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParamSchema;
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  // Opaque, provider-specific — Gemini 3 requires this to be echoed back verbatim on the next
  // turn's functionCall part or multi-turn tool use degrades. Agent code never reads this.
  thoughtSignature?: string;
}

export interface LlmMessage {
  role: "system" | "user" | "model" | "tool";
  text?: string;
  toolCalls?: ToolCall[];
  toolResults?: { name: string; result: unknown }[];
}

export interface LlmResponse {
  text: string;
  toolCalls: ToolCall[];
}

export interface DecisionOutput {
  action: string;
  reasoning: string;
  manualProcedure: string[];
  confidence: number;
  escalationReason: string;
  status: "auto_executed" | "pending_approval" | "ask_human";
}

// --- internals ---------------------------------------------------------------------------

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set (check .env)");
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

function toGeminiSchema(schema: ToolParamSchema): Record<string, unknown> {
  const typeMap: Record<JsonSchemaType, SchemaType> = {
    string: SchemaType.STRING,
    number: SchemaType.NUMBER,
    boolean: SchemaType.BOOLEAN,
    object: SchemaType.OBJECT,
    array: SchemaType.ARRAY,
  };
  const out: Record<string, unknown> = { type: typeMap[schema.type] };
  if (schema.description) out.description = schema.description;
  if (schema.enum) out.enum = schema.enum;
  if (schema.items) out.items = toGeminiSchema(schema.items);
  if (schema.properties) {
    out.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [key, toGeminiSchema(value)]),
    );
  }
  if (schema.required) out.required = schema.required;
  return out;
}

function extractSystemText(messages: LlmMessage[]): string | undefined {
  return (
    messages
      .filter((m) => m.role === "system")
      .map((m) => m.text ?? "")
      .join("\n\n") || undefined
  );
}

function toGeminiContents(messages: LlmMessage[]): Content[] {
  const contents: Content[] = [];
  for (const message of messages) {
    if (message.role === "system") continue;

    if (message.role === "user") {
      contents.push({ role: "user", parts: [{ text: message.text ?? "" }] });
    } else if (message.role === "model") {
      const parts: Part[] = [];
      if (message.text) parts.push({ text: message.text });
      for (const call of message.toolCalls ?? []) {
        const part: Part = { functionCall: { name: call.name, args: call.args } };
        if (call.thoughtSignature) {
          (part as Part & { thoughtSignature?: string }).thoughtSignature = call.thoughtSignature;
        }
        parts.push(part);
      }
      contents.push({ role: "model", parts });
    } else if (message.role === "tool") {
      // This API build rejects role "function" ("Role 'function' is not supported"; valid
      // roles are SYSTEM/USER/ASSISTANT/MODEL/etc) — function responses go under "user".
      const parts: Part[] = (message.toolResults ?? []).map((result) => ({
        functionResponse: { name: result.name, response: { result: result.result } },
      }));
      contents.push({ role: "user", parts });
    }
  }
  return contents;
}

// --- public interface ---------------------------------------------------------------------

export async function generateWithTools(
  messages: LlmMessage[],
  tools: ToolDefinition[],
): Promise<LlmResponse> {
  const model = getClient().getGenerativeModel({
    model: MODEL,
    systemInstruction: extractSystemText(messages),
    tools: [
      {
        functionDeclarations: tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          parameters: toGeminiSchema(tool.parameters) as never,
        })),
      },
    ],
  });

  const result = await model.generateContent({ contents: toGeminiContents(messages) });
  const response = result.response;

  // Read raw parts (not response.functionCalls()) so we can carry thoughtSignature through.
  const rawParts = response.candidates?.[0]?.content?.parts ?? [];
  const toolCalls: ToolCall[] = rawParts
    .filter((part): part is Part & { functionCall: NonNullable<Part["functionCall"]> } =>
      Boolean(part.functionCall),
    )
    .map((part) => ({
      name: part.functionCall.name,
      args: (part.functionCall.args ?? {}) as Record<string, unknown>,
      thoughtSignature: (part as Part & { thoughtSignature?: string }).thoughtSignature,
    }));

  let text = "";
  try {
    text = response.text() ?? "";
  } catch {
    // response.text() throws if the only parts are functionCalls — fine, toolCalls covers it.
  }

  return { text, toolCalls };
}

const DECISION_SCHEMA: ToolParamSchema = {
  type: "object",
  properties: {
    action: { type: "string", description: "One sentence: what the agent did or is proposing." },
    reasoning: {
      type: "string",
      description: "Why this action, referencing what the tools returned.",
    },
    manualProcedure: {
      type: "array",
      items: { type: "string" },
      description:
        "Numbered steps a finance officer would follow to reach this same judgment without " +
        "the agent. Explain WHY each check mattered to this decision, not just what was called.",
    },
    confidence: { type: "number", description: "0 to 1: confidence this is the right call." },
    escalationReason: {
      type: "string",
      description:
        "What was tried, what was found, what remains unresolved, and proposed options with a recommendation. Empty string if not escalating.",
    },
    status: {
      type: "string",
      enum: ["auto_executed", "pending_approval", "ask_human"],
    },
  },
  required: ["action", "reasoning", "manualProcedure", "confidence", "escalationReason", "status"],
};

export async function generateDecision(messages: LlmMessage[]): Promise<DecisionOutput> {
  const model = getClient().getGenerativeModel({
    model: MODEL,
    systemInstruction: extractSystemText(messages),
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: toGeminiSchema(DECISION_SCHEMA) as never,
    },
  });

  const result = await model.generateContent({ contents: toGeminiContents(messages) });
  return JSON.parse(result.response.text()) as DecisionOutput;
}
