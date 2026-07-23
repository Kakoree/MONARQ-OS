import { notFound } from "next/navigation";
import { getTeaching } from "@/lib/teachings";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CompleteButton } from "./CompleteButton";

export default async function TeachingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teaching = await getTeaching(id);

  if (!teaching) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl text-paper">
          {teaching.title}
        </h1>
        <p className="mt-2 text-sm text-stone">{teaching.summary}</p>
      </div>

      {teaching.isUnlocked ? (
        <>
          <Card className="whitespace-pre-wrap text-sm leading-relaxed text-paper/90">
            {teaching.body}
          </Card>
          <CompleteButton
            teachingId={teaching.id}
            isCompleted={teaching.isCompleted}
          />
        </>
      ) : (
        <Card>
          <Badge>Locked</Badge>
          <p className="mt-3 text-sm text-stone">
            This teaching unlocks at a higher membership level.
          </p>
        </Card>
      )}
    </div>
  );
}
