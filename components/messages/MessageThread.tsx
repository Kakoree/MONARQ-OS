import Link from "next/link";
import type { Message } from "@/lib/messages";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";

// Shared by pod threads and 1:1 threads — the only difference between them
// is who can post, which is enforced in the database, not here.
export function MessageThread({
  messages,
  emptyLabel,
  onDelete,
}: {
  messages: Message[];
  emptyLabel: string;
  onDelete?: (messageId: string) => (formData: FormData) => void | Promise<void>;
}) {
  if (messages.length === 0) {
    return (
      <Card>
        <p className="text-sm text-stone">{emptyLabel}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div key={message.id} className="flex gap-3">
          <Link href={`/members/${message.userId}`} className="shrink-0">
            <Avatar url={message.avatarUrl} name={message.displayName} size={32} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-stone">
              <Link
                href={`/members/${message.userId}`}
                className="text-paper/80 transition-colors hover:text-gold"
              >
                {message.displayName}
              </Link>
              {message.isOwn && <span className="text-stone"> (you)</span>}
              {" · "}
              {formatTime(message.createdAt)}
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-paper/90">
              {message.body}
            </p>
          </div>
          {message.isOwn && onDelete && (
            <form action={onDelete(message.id)} className="shrink-0">
              <button
                type="submit"
                className="text-xs text-stone transition-colors hover:text-danger"
              >
                Delete
              </button>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}

function formatTime(createdAt: string): string {
  return new Date(createdAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
