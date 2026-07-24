import { getChallenges } from "@/lib/challenges";
import { Card } from "@/components/ui/Card";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { Reveal } from "@/components/motion/Reveal";

export default async function ChallengesPage() {
  const challenges = await getChallenges();

  if (!challenges) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Challenges</h1>
        <p className="mt-1 text-sm text-stone">
          Commit, follow through, and earn XP toward your rank.
        </p>
      </div>

      {challenges.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">
            No challenges are open right now.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {challenges.map((challenge, index) => (
            <Reveal key={challenge.id} delay={index * 0.04}>
              <ChallengeCard challenge={challenge} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
