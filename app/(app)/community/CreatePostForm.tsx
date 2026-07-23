"use client";

import { useActionState } from "react";
import { createPost, type PostFormState } from "./actions";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function CreatePostForm() {
  const [state, action, pending] = useActionState<PostFormState, FormData>(
    createPost,
    undefined
  );

  return (
    <Card>
      <form action={action} className="space-y-3">
        <Textarea
          name="body"
          rows={3}
          placeholder="Share a win, a reflection, or an update..."
          required
        />
        <div className="flex items-center justify-between">
          {state?.error ? (
            <p className="text-sm text-danger">{state.error}</p>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
