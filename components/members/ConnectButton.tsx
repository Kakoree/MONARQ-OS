"use client";

import { useActionState } from "react";
import Link from "next/link";
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
      <div className="flex items-center gap-3">
        <Button variant="secondary" disabled className="cursor-default">
          Connected
        </Button>
        <Link
          href={`/circle/${recipientId}`}
          className="text-sm text-stone transition-colors hover:text-gold"
        >
          Message
        </Link>
      </div>
    );
  }

  if (initialState === "outgoing_pending") {
    return <Button variant="secondary" disabled className="cursor-default">Request sent</Button>;
  }

  if (initialState === "incoming_pending") {
    return (
      <p className="text-sm text-stone">
        This member sent you a request — respond from{" "}
        <Link href="/circle" className="text-gold hover:underline">
          your Circle
        </Link>
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
