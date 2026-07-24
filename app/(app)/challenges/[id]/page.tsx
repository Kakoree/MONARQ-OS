import { notFound } from "next/navigation";
import { getChallenge, getGroupChallengeProgress } from "@/lib/challenges";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { JoinButton, CompleteButton } from "./ActionButtons";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = await getChallenge(id);

  if (!challenge) {
    notFound();
  }

  const groupProgress = challenge.isGroup
    ? await getGroupChallengeProgress(challenge.id)
    : null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl text-paper">
            {challenge.title}
          </h1>
          <Badge className="border-gold/40 text-gold">
            {challenge.xpReward} XP
          </Badge>
        </div>
        <p className="mt-2 text-sm text-stone">{challenge.description}</p>
      </div>

      {groupProgress && (
        <Card>
          <p className="text-xs uppercase tracking-wider text-stone">
            Shared progress
          </p>
          <p className="mt-2 text-sm text-paper">
            {groupProgress.completedCount} of {groupProgress.activeMemberCount}{" "}
            active members have completed this.
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-gold"
              style={{
                width: `${
                  groupProgress.activeMemberCount > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (groupProgress.completedCount /
                            groupProgress.activeMemberCount) *
                            100
                        )
                      )
                    : 0
                }%`,
              }}
            />
          </div>
        </Card>
      )}

      <Card>
        {challenge.isCompleted ? (
          <p className="text-sm text-gold">
            You&apos;ve completed this challenge.
          </p>
        ) : challenge.isJoined ? (
          <div className="space-y-3">
            <p className="text-sm text-stone">
              You&apos;re in. Mark it complete once you&apos;ve followed
              through.
            </p>
            <CompleteButton challengeId={challenge.id} />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-stone">
              Join this challenge to start tracking it.
            </p>
            <JoinButton challengeId={challenge.id} />
          </div>
        )}
      </Card>
    </div>
  );
}
