"use client";

import { useActionState } from "react";
import { uploadAvatar, type AvatarFormState } from "./actions";
import { Button } from "@/components/ui/Button";

export function AvatarUploadForm() {
  const [state, action, pending] = useActionState<AvatarFormState, FormData>(
    uploadAvatar,
    undefined
  );

  return (
    <form action={action} className="space-y-2">
      <input
        type="file"
        name="avatar"
        accept="image/png,image/jpeg,image/webp"
        required
        className="block text-xs text-stone file:mr-3 file:rounded-md file:border file:border-line file:bg-surface file:px-3 file:py-1.5 file:text-xs file:text-paper file:transition-colors hover:file:border-gold/60"
      />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Uploading..." : "Upload avatar"}
      </Button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
