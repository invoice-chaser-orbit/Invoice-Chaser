// Calendar adapter — simulated (Google Calendar). A live adapter would export this same
// function with the same signature; agent/tools.ts's dispatcher would not change — only this
// file would.

export async function scheduleFollowup(customerId: unknown, followUpDate: unknown, reason: unknown) {
  return {
    simulated: true,
    eventId: `sim-cal-${Date.now()}`,
    customerId,
    followUpDate,
    reason,
    scheduledAt: new Date().toISOString(),
  };
}
