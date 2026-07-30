'use server';

import { executeHumanAction, type HumanAction } from '@/lib/executor';
import { getDecisions } from '@/lib/decisions';
import { revalidatePath } from 'next/cache';

export async function submitHumanAction(decisionId: string, humanAction: HumanAction) {
  const decisions = await getDecisions();
  const decision = decisions.find((d) => d.id === decisionId);
  if (!decision) throw new Error(`Decision ${decisionId} not found`);
  await executeHumanAction({ ...decision, trail: [] }, humanAction);
  revalidatePath('/approvals');
}
