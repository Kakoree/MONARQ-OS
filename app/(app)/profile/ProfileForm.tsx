"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function ProfileForm({
  displayName,
  bio,
}: {
  displayName: string;
  bio: string;
}) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    undefined
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider text-stone">
          Display name
        </label>
        <Input name="display_name" defaultValue={displayName} required maxLength={60} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider text-stone">
          Bio
        </label>
        <Textarea
          name="bio"
          rows={3}
          defaultValue={bio}
          maxLength={300}
          placeholder="A short line about who you are."
        />
      </div>
      <div className="flex items-center justify-between">
        {state?.error ? (
          <p className="text-sm text-danger">{state.error}</p>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
