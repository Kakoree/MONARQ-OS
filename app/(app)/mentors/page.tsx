import Link from "next/link";
import { getMentorDirectory } from "@/lib/mentors";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export default async function MentorsPage() {
  const mentors = await getMentorDirectory();

  if (!mentors) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-paper">Mentors</h1>
          <p className="mt-1 text-sm text-stone">
            Admin-approved members guiding structured tracks.
          </p>
        </div>
        <Link
          href="/mentors/apply"
          className="text-xs text-stone transition-colors hover:text-gold"
        >
          Become a mentor →
        </Link>
      </div>

      {mentors.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">No mentors yet.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {mentors.map((mentor) => (
            <Link key={mentor.id} href={`/mentors/${mentor.id}`}>
              <Card className="h-full space-y-2 transition-colors hover:border-gold/40">
                <div className="flex items-center gap-3">
                  <Avatar url={mentor.avatarUrl} name={mentor.displayName} size={44} />
                  <div>
                    <p className="text-sm font-medium text-paper">
                      {mentor.displayName}
                    </p>
                    <p className="text-xs text-stone">{mentor.headline}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {mentor.focusAreas.map((area) => (
                    <Badge key={area}>{area}</Badge>
                  ))}
                </div>
                {!mentor.isAcceptingRequests && (
                  <p className="text-xs text-stone">Not accepting requests right now</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
