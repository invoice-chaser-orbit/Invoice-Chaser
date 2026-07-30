"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { IcButton } from "@/components/ui/ic-button";
import type { Decision } from "@/lib/types";
import type { HumanActionType } from "@/lib/executor";

const COPY: Record<"edit" | "redirect" | "override", { title: string; description: string }> = {
  edit: {
    title: "Edit action",
    description: "Adjust the action or reasoning before it executes.",
  },
  redirect: {
    title: "Redirect action",
    description: "Send this case down a different path than the agent proposed.",
  },
  override: {
    title: "Override decision",
    description: "Replace the agent's action and reasoning entirely.",
  },
};

export function HumanActionDialog({
  open,
  onOpenChange,
  actionType,
  decision,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: Exclude<HumanActionType, "approve">;
  decision: Decision;
  onSubmit: (fields: { editedAction: string; editedReasoning: string; humanNote: string }) => void;
  submitting: boolean;
}) {
  const [editedAction, setEditedAction] = useState(decision.action);
  const [editedReasoning, setEditedReasoning] = useState(decision.reasoning);
  const [humanNote, setHumanNote] = useState("");
  const copy = COPY[actionType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-caption text-neutral-500 uppercase">Action</label>
            <Textarea
              className="mt-1"
              value={editedAction}
              onChange={(e) => setEditedAction(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="text-caption text-neutral-500 uppercase">Reasoning</label>
            <Textarea
              className="mt-1"
              value={editedReasoning}
              onChange={(e) => setEditedReasoning(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="text-caption text-neutral-500 uppercase">Note (optional)</label>
            <Textarea
              className="mt-1"
              value={humanNote}
              onChange={(e) => setHumanNote(e.target.value)}
              rows={2}
              placeholder="Why are you making this change?"
            />
          </div>
        </div>

        <DialogFooter>
          <IcButton
            variant="outlined"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </IcButton>
          <IcButton
            size="sm"
            disabled={submitting}
            onClick={() => onSubmit({ editedAction, editedReasoning, humanNote })}
          >
            {submitting ? "Submitting…" : "Submit"}
          </IcButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
