// Debug toggle — lets the team force a specific tool to fail on demand, for live demo
// purposes (Day 8: "break a tool deliberately and show recovery"). Not used in normal operation.

let forcedFailureTool: string | null = null;

/**
 * Force the next call to this tool name to fail (simulating an outage).
 * Call forceToolFailure(null) to clear it.
 */
export function forceToolFailure(toolName: string | null): void {
  forcedFailureTool = toolName;
  if (toolName) {
    console.log(`🔴 DEBUG: forcing "${toolName}" to fail on next call`);
  } else {
    console.log(`🟢 DEBUG: cleared forced failure`);
  }
}

/**
 * Check if this tool should be forced to fail right now.
 * Call this at the start of any real tool implementation, before doing real work.
 */
export function shouldForceFailure(toolName: string): boolean {
  return forcedFailureTool === toolName;
}

/**
 * Throws if this tool is currently set to force-fail. Convenience wrapper —
 * call at the top of a tool's real implementation.
 */
export function checkForcedFailure(toolName: string): void {
  if (shouldForceFailure(toolName)) {
    throw new Error(`[DEBUG] Forced failure for tool: ${toolName}`);
  }
}
