import type { TrailStep } from "../lib/types.js";
import { saveTrailStep } from "../lib/decisions.js";

export async function withRecovery(options: RecoveryOptions): Promise<RecoveryResult> {
  const { decisionId, stepIndex, toolName, input, primaryCall, fallbackCall, maxRetries = 2, retryDelayMs = 1000 } = options;

  let lastError: unknown;
  let currentStepIndex = stepIndex;

  // Rung 1: retry with backoff
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const output = await primaryCall();
      const step: TrailStep = {
        decisionId,
        stepIndex: currentStepIndex,
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

      // Log THIS failed attempt immediately — no holes, every attempt visible
      await saveTrailStep({
        decisionId,
        stepIndex: currentStepIndex,
        toolName,
        input,
        output: { error: String(err), attempt: attempt + 1 },
        timestamp: new Date().toISOString(),
        success: false,
      });
      currentStepIndex++;

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs * (attempt + 1)));
      }
    }
  }

  // Rung 2: fallback to an equivalent tool
  if (fallbackCall) {
    try {
      const output = await fallbackCall();
      const step: TrailStep = {
        decisionId,
        stepIndex: currentStepIndex,
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
        stepIndex: currentStepIndex,
        toolName: `${toolName}_fallback`,
        input,
        output: { error: String(fallbackErr) },
        timestamp: new Date().toISOString(),
        success: false,
      });
      currentStepIndex++;
    }
  }

  // Rung 3: degrade gracefully
  const degradedStep: TrailStep = {
    decisionId,
    stepIndex: currentStepIndex,
    toolName: `${toolName}_degraded`,
    input,
    output: { status: "queued_pending", reason: "All retries and fallback exhausted" },
    timestamp: new Date().toISOString(),
    success: true,
  };
  await saveTrailStep(degradedStep);
  currentStepIndex++;

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
    stepIndex: currentStepIndex,
    toolName: "ask_human",
    input,
    output: escalationOutput,
    timestamp: new Date().toISOString(),
    success: true,
  };
  await saveTrailStep(escalationStep);

  return { output: escalationOutput, rungUsed: "escalated", step: escalationStep };
}