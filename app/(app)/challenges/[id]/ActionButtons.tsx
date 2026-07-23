import { joinChallenge, completeChallenge } from "../actions";
import { Button } from "@/components/ui/Button";

export function JoinButton({ challengeId }: { challengeId: string }) {
  return (
    <form action={joinChallenge.bind(null, challengeId)}>
      <Button type="submit">Join challenge</Button>
    </form>
  );
}

export function CompleteButton({ challengeId }: { challengeId: string }) {
  return (
    <form action={completeChallenge.bind(null, challengeId)}>
      <Button type="submit">Mark complete</Button>
    </form>
  );
}
