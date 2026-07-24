import Link from "next/link";
import { getCircle } from "@/lib/connections";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { respondToConnection } from "./actions";

export default async function CirclePage() {
  const circle = await getCircle();

  if (!circle) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Circle</h1>
        <p className="mt-1 text-sm text-stone">
          The members you&apos;re accountable to, and who are accountable to
          you.
        </p>
      </div>

      {circle.incoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
            Requests
          </h2>
          {circle.incoming.map((member) => (
            <Card key={member.connectionId} className="flex items-center justify-between gap-3">
              <Link
                href={`/members/${member.userId}`}
                className="flex items-center gap-3"
              >
                <Avatar url={member.avatarUrl} name={member.displayName} size={40} />
                <span className="text-sm text-paper">{member.displayName}</span>
              </Link>
              <div className="flex items-center gap-2">
                <form action={respondToConnection.bind(null, member.connectionId, true)}>
                  <Button type="submit" className="px-3 py-1.5 text-xs">
                    Accept
                  </Button>
                </form>
                <form action={respondToConnection.bind(null, member.connectionId, false)}>
                  <Button
                    type="submit"
                    variant="secondary"
                    className="px-3 py-1.5 text-xs"
                  >
                    Decline
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
          Connections
        </h2>
        {circle.connections.length === 0 ? (
          <Card>
            <p className="text-sm text-stone">
              No connections yet. Visit a member&apos;s profile to connect.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {circle.connections.map((member) => (
              <Link key={member.connectionId} href={`/members/${member.userId}`}>
                <Card className="flex items-center gap-3 transition-colors hover:border-gold/40">
                  <Avatar url={member.avatarUrl} name={member.displayName} size={40} />
                  <span className="text-sm text-paper">{member.displayName}</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
