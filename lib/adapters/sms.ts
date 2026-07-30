// SMS adapter — simulated (Twilio/Ideamart). A live adapter would export this same function
// with the same signature; agent/tools.ts's dispatcher would not change — only this file would.

export async function sendSmsReminder(customerId: unknown, tone: unknown, message: unknown) {
  return {
    simulated: true,
    messageId: `sim-sms-${Date.now()}`,
    to: customerId,
    tone,
    channel: "sms",
    sentAt: new Date().toISOString(),
  };
}
