import Link from "next/link";
import { notFound } from "next/navigation";
import { getDirectThread } from "@/lib/messages";
import { Avatar } from "@/components/ui/Avatar";
import { MessageThread } from "@/components/messages/MessageThread";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { sendDirectMessageAction } from "../actions";

export default async function DirectThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const thread = await getDirectThread(id);

  // Null covers both "no such member" and "not connected to them" — the
  // two are deliberately indistinguishable from outside.
  if (!thread) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/circle" className="text-xs text-stone hover:text-paper">
          ← Circle
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <Avatar url={thread.avatarUrl} name={thread.displayName} size={44} />
          <div>
            <h1 className="font-display text-2xl text-paper">{thread.displayName}</h1>
            <Link
              href={`/members/${thread.otherUserId}`}
              className="text-xs text-stone transition-colors hover:text-gold"
            >
              View profile
            </Link>
          </div>
        </div>
      </div>

      <MessageThread
        messages={thread.messages}
        emptyLabel="No messages yet. Start the conversation."
      />

      <MessageComposer
        action={sendDirectMessageAction.bind(null, thread.otherUserId)}
        placeholder={`Message ${thread.displayName}…`}
      />
    </div>
  );
}
