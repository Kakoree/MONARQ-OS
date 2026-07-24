import { getChallengesAdmin } from "@/lib/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CreateChallengeForm } from "./CreateChallengeForm";
import { toggleChallengePublished } from "./actions";
import { cn } from "@/lib/cn";

export default async function AdminChallengesPage() {
  const challenges = await getChallengesAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-paper">Challenges</h1>
        <p className="mt-1 text-sm text-stone">
          Group challenges add a shared progress display across active
          members, alongside the normal individual join/complete flow.
        </p>
      </div>

      <CreateChallengeForm />

      {challenges.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">No challenges yet.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-md border border-line">
          <div className="divide-y divide-line">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm text-paper">
                    {challenge.title}
                    {challenge.isGroup && (
                      <span className="ml-2 font-sans text-xs text-stone">
                        group
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-stone">
                    {challenge.xpReward} XP
                    {challenge.startsAt &&
                      ` · starts ${new Date(challenge.startsAt).toLocaleDateString("en-US")}`}
                    {challenge.endsAt &&
                      ` · ends ${new Date(challenge.endsAt).toLocaleDateString("en-US")}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(challenge.isPublished && "border-gold/40 text-gold")}
                  >
                    {challenge.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <form
                    action={toggleChallengePublished.bind(
                      null,
                      challenge.id,
                      !challenge.isPublished
                    )}
                  >
                    <button
                      type="submit"
                      className="text-xs text-stone transition-colors hover:text-gold"
                    >
                      {challenge.isPublished ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
