"use server";

import { executeHumanAction, type HumanAction } from "@/lib/executor";
import { getDecisions } from "@/lib/decisions";
import { latestDecisionsByInvoice } from "@/lib/decision-history";
import { revalidatePath } from "next/cache";

export async function submitHumanAction(decisionId: string, humanAction: HumanAction) {
  const decisions = await getDecisions();
  const decision = decisions.find((d) => d.id === decisionId);
  if (!decision) throw new Error(`Decision ${decisionId} not found`);
  const current = latestDecisionsByInvoice(decisions).find(
    (item) => item.invoiceId === decision.invoiceId,
  );
  if (current?.id !== decisionId) {
    throw new Error("A newer decision exists for this invoice. Review the current case instead.");
  }
  const result = await executeHumanAction({ ...decision, trail: [] }, humanAction);
  revalidatePath("/approvals");
  return result;
}
