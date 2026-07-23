import Link from "next/link";
import { getMembers } from "@/lib/profile";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";

export default async function MembersPage() {
  const members = await getMembers();

  if (!members) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Members</h1>
        <p className="mt-1 text-sm text-stone">Who else is inside MONARQ.</p>
      </div>

      {members.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">No members yet.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Link key={member.id} href={`/members/${member.id}`}>
              <Card className="h-full transition-colors hover:border-gold/40">
                <div className="flex items-center gap-3">
                  <Avatar
                    url={member.avatarUrl}
                    name={member.displayName}
                    size={44}
                  />
                  <div>
                    <p className="text-sm font-medium text-paper">
                      {member.displayName}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-stone">
                      Level {member.level}
                    </p>
                  </div>
                </div>
                {member.bio && (
                  <p className="mt-3 line-clamp-2 text-sm text-stone">
                    {member.bio}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
