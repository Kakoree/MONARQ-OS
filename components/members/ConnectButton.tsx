"use client";

import { useActionState } from "react";
import { connectAction, type ConnectFormState } from "@/app/(app)/members/[id]/actions";
import { Button } from "@/components/ui/Button";
import type { ConnectionState } from "@/lib/connections";

export function ConnectButton({
  recipientId,
  initialState,
}: {
  recipientId: string;
  initialState: ConnectionState;
}) {
  const boundAction = connectAction.bind(null, recipientId);
  const [state, action, pending] = useActionState<ConnectFormState, FormData>(
    boundAction,
    undefined
  );

  if (initialState === "connected") {
    return (
      <Button variant="secondary" disabled className="cursor-default">
        Connected
      </Button>
    );
  }

  if (initialState === "outgoing_pending") {
    return <Button variant="secondary" disabled className="cursor-default">Request sent</Button>;
  }

  if (initialState === "incoming_pending") {
    return (
      <p className="text-sm text-stone">
        This member sent you a request — respond from{" "}
        <a href="/circle" className="text-gold hover:underline">
          your Circle
        </a>
        .
      </p>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Connect"}
      </Button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
