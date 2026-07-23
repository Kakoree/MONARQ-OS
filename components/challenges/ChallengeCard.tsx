import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ChallengeSummary } from "@/lib/challenges";

export function ChallengeCard({ challenge }: { challenge: ChallengeSummary }) {
  return (
    <Link href={`/challenges/${challenge.id}`}>
      <Card className="h-full transition-colors hover:border-gold/40">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-paper">{challenge.title}</p>
          <Badge className="border-gold/40 text-gold">
            {challenge.xpReward} XP
          </Badge>
        </div>
        <p className="mt-2 text-sm text-stone">{challenge.description}</p>
        {challenge.isCompleted ? (
          <p className="mt-3 text-xs uppercase tracking-wider text-gold">
            Completed
          </p>
        ) : (
          challenge.isJoined && (
            <p className="mt-3 text-xs uppercase tracking-wider text-stone">
              In progress
            </p>
          )
        )}
      </Card>
    </Link>
  );
}
