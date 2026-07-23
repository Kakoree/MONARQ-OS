"use client";

import { useActionState } from "react";
import { addComment, type PostFormState } from "../actions";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function AddCommentForm({ postId }: { postId: string }) {
  const boundAddComment = addComment.bind(null, postId);
  const [state, action, pending] = useActionState<PostFormState, FormData>(
    boundAddComment,
    undefined
  );

  return (
    <form action={action} className="space-y-3">
      <Textarea name="body" rows={2} placeholder="Add a comment..." required />
      <div className="flex items-center justify-between">
        {state?.error ? (
          <p className="text-sm text-danger">{state.error}</p>
        ) : (
          <span />
        )}
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Posting..." : "Comment"}
        </Button>
      </div>
    </form>
  );
}
