"use client";

import { useActionState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type ComposerState = { error: string } | undefined;

export function MessageComposer({
  action,
  placeholder,
  submitLabel = "Send",
}: {
  action: (
    prevState: ComposerState,
    formData: FormData
  ) => Promise<ComposerState>;
  placeholder: string;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<ComposerState, FormData>(
    action,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  // A successful post returns undefined state; clear the box so the next
  // message doesn't start with the last one still in it.
  useEffect(() => {
    if (!pending && !state?.error) formRef.current?.reset();
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <Textarea name="body" rows={3} placeholder={placeholder} maxLength={2000} required />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Sending..." : submitLabel}
        </Button>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      </div>
    </form>
  );
}
