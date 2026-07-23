import { toggleTeachingComplete } from "./actions";
import { Button } from "@/components/ui/Button";

export function CompleteButton({
  teachingId,
  isCompleted,
}: {
  teachingId: string;
  isCompleted: boolean;
}) {
  return (
    <form action={toggleTeachingComplete.bind(null, teachingId)}>
      <Button type="submit" variant={isCompleted ? "secondary" : "primary"}>
        {isCompleted ? "Mark as not complete" : "Mark as complete"}
      </Button>
    </form>
  );
}
