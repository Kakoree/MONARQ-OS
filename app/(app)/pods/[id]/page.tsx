import Link from "next/link";
import { notFound } from "next/navigation";
import { getPod } from "@/lib/pods";
import { getPodMessages } from "@/lib/messages";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { MessageThread } from "@/components/messages/MessageThread";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { postPodMessageAction, deletePodMessageAction } from "../actions";
import { cn } from "@/lib/cn";

export default async function PodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pod = await getPod(id);

  if (!pod) {
    notFound();
  }

  const messages = await getPodMessages(id);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/pods" className="text-xs text-stone hover:text-paper">
          ← Pods
        </Link>
        <h1 className="mt-2 font-display text-3xl text-paper">{pod.name}</h1>
        {pod.description && (
          <p className="mt-1 text-sm text-stone">{pod.description}</p>
        )}
      </div>

      {pod.trackingCount > 0 && (
        <Card className="border-gold/40">
          <p className="text-sm text-paper">
            {pod.checkedInCount} of {pod.trackingCount} checked in today
          </p>
          <p className="mt-1 text-xs text-stone">
            Counts only pod-mates who have habits set up.
          </p>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
          Roster
        </h2>
        <div className="overflow-hidden rounded-md border border-line">
          <div className="divide-y divide-line">
            {pod.members.map((member) => (
              <div
                key={member.userId}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <Link
                  href={`/members/${member.userId}`}
                  className="flex items-center gap-3"
                >
                  <Avatar url={member.avatarUrl} name={member.displayName} size={36} />
                  <div>
                    <p className="text-sm text-paper">
                      {member.displayName}
                      {member.isSelf && <span className="text-stone"> (you)</span>}
                    </p>
                    <p className="text-xs text-stone">
                      {member.hasHabits
                        ? `${member.streak}-day streak`
                        : "No habits set up yet"}
                    </p>
                  </div>
                </Link>
                {member.hasHabits && (
                  <Badge
                    className={cn(member.checkedInToday && "border-gold/40 text-gold")}
                  >
                    {member.checkedInToday ? "Checked in" : "Not yet today"}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
          Thread
        </h2>
        <MessageThread
          messages={messages}
          emptyLabel="Nothing here yet. Say something to your pod."
          onDelete={(messageId) => deletePodMessageAction.bind(null, id, messageId)}
        />
        <MessageComposer
          action={postPodMessageAction.bind(null, id)}
          placeholder="Message your pod…"
          submitLabel="Post"
        />
      </div>
    </div>
  );
}
