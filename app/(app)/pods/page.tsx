import Link from "next/link";
import { getMyPods } from "@/lib/pods";
import { Card } from "@/components/ui/Card";

export default async function PodsPage() {
  const pods = await getMyPods();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Pods</h1>
        <p className="mt-1 text-sm text-stone">
          Your accountability groups — who&apos;s showing up, and who needs a
          nudge today.
        </p>
      </div>

      {pods.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">
            You&apos;re not in a pod yet. Pods are assigned by MONARQ — you
            &apos;ll be notified when you&apos;re added to one.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {pods.map((pod) => (
            <Link key={pod.id} href={`/pods/${pod.id}`}>
              <Card className="h-full transition-colors hover:border-gold/40">
                <p className="text-sm text-paper">{pod.name}</p>
                <p className="mt-1 text-xs text-stone">
                  {pod.memberCount} member{pod.memberCount === 1 ? "" : "s"}
                </p>
                {pod.description && (
                  <p className="mt-2 text-sm text-paper/80">{pod.description}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
