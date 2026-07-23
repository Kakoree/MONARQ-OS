import { notFound } from "next/navigation";
import { getChallenge } from "@/lib/challenges";
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
