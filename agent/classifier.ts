import { generateWithTools, type LlmMessage } from "../lib/llm.js";

export type ReplyClassification = "promise" | "dispute" | "partial-payment" | "query";

const validCategories: ReplyClassification[] = ["promise", "dispute", "partial-payment", "query"];

export function parseClassification(rawText: string): ReplyClassification {
  const classification = rawText.trim().toLowerCase() as ReplyClassification;
  if (!validCategories.includes(classification)) {
    throw new Error(`Unexpected classification result: "${rawText}"`);
  }
  return classification;
}

export async function classifyReply(replyText: string): Promise<ReplyClassification> {
  const prompt = `Classify this customer email reply into exactly one category:
- "promise": customer promises to pay, gives a date or commitment
- "dispute": customer disputes the invoice, claims it's wrong or already paid
- "partial-payment": customer mentions paying part of the amount
- "query": customer is asking a question, needs more information, unclear intent

Reply text: "${replyText}"

Respond with ONLY the category name, nothing else.`;

  const messages: LlmMessage[] = [{ role: "user", text: prompt }];
  const result = await generateWithTools(messages, []);

  return parseClassification(result.text);
}