import type { TrailStep } from "../lib/types.js";
import { saveTrailStep } from "../lib/decisions.js";

export interface RecoveryOptions {
  decisionId: string;
  stepIndex: number;
  toolName: string;
  input: Record<string, unknown>;
  primaryCall: () => Promise<unknown>;
  fallbackCall?: () => Promise<unknown>;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface RecoveryResult {
  output: unknown;
  rungUsed: "primary" | "fallback" | "degraded" | "escalated";
  step: TrailStep;
}

/**
 * Wraps a tool call in the four-rung recovery ladder:
 * retry with backoff -> fallback to an equivalent tool -> degrade gracefully
 * (queue, mark pending) -> escalate with a structured report.
 * Every attempt is logged to trail_steps, successes and failures alike.
 */
export async function withRecovery(options: RecoveryOptions): Promise<RecoveryResult> {
  const { decisionId, stepIndex, toolName, input, primaryCall, fallbackCall, maxRetries = 2, retryDelayMs = 1000 } = options;

  // Rung 1: retry with backoff
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const output = await primaryCall();
      const step: TrailStep = {
        decisionId,
        stepIndex,
        toolName,
        input,
        output,
        timestamp: new Date().toISOString(),
        success: true,
      };
      await saveTrailStep(step);
      return { output, rungUsed: "primary", step };
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs * (attempt + 1)));
      }
    }
  }

  // Log the primary failure before moving to the next rung
  await saveTrailStep({
    decisionId,
    stepIndex,
    toolName,
    input,
    output: { error: String(lastError) },
    timestamp: new Date().toISOString(),
    success: false,
  });

  // Rung 2: fallback to an equivalent tool
  if (fallbackCall) {
    try {
      const output = await fallbackCall();
      const step: TrailStep = {
        decisionId,
        stepIndex: stepIndex + 1,
        toolName: `${toolName}_fallback`,
        input,
        output,
        timestamp: new Date().toISOString(),
        success: true,
      };
      await saveTrailStep(step);
      return { output, rungUsed: "fallback", step };
    } catch (fallbackErr) {
      await saveTrailStep({
        decisionId,
        stepIndex: stepIndex + 1,
        toolName: `${toolName}_fallback`,
        input,
        output: { error: String(fallbackErr) },
        timestamp: new Date().toISOString(),
        success: false,
      });
    }
  }

  // Rung 3: degrade gracefully — queue and mark pending rather than drop
  const degradedStep: TrailStep = {
    decisionId,
    stepIndex: stepIndex + 2,
    toolName: `${toolName}_degraded`,
    input,
    output: { status: "queued_pending", reason: "All retries and fallback exhausted" },
    timestamp: new Date().toISOString(),
    success: true, // degrading gracefully IS the successful outcome at this rung
  };
  await saveTrailStep(degradedStep);

  // Rung 4: escalate with a structured report
  const escalationOutput = {
    whatTried: `Called ${toolName} directly, retried ${maxRetries} times${fallbackCall ? ", then attempted fallback" : ""}.`,
    whatFound: `All attempts failed. Last error: ${String(lastError)}`,
    whatUnresolved: `Could not complete ${toolName} for this case.`,
    options: [
      "Retry manually once the underlying issue is fixed",
      "Handle this case manually outside the agent",
      "Skip this step and proceed with reduced confidence",
    ],
    recommendation: "Retry manually once connectivity/service is confirmed restored.",
  };
  const escalationStep: TrailStep = {
    decisionId,
    stepIndex: stepIndex + 3,
    toolName: "ask_human",
    input,
    output: escalationOutput,
    timestamp: new Date().toISOString(),
    success: true,
  };
  await saveTrailStep(escalationStep);

  return { output: escalationOutput, rungUsed: "escalated", step: escalationStep };
}