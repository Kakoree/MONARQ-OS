import { getPodsAdmin, getAllMembers } from "@/lib/admin";
import { Card } from "@/components/ui/Card";
import { CreatePodForm } from "./CreatePodForm";
import { PodCard } from "./PodCard";

export default async function AdminPodsPage() {
  const [pods, members] = await Promise.all([getPodsAdmin(), getAllMembers()]);
  const activeMembers = members.filter((m) => m.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-paper">Pods</h1>
        <p className="mt-1 text-sm text-stone">
          Accountability groups. Members are assigned here, not self-organised
          — anyone added gets a notification and can see their pod-mates&apos;
          check-in status and streaks (never their habit names).
        </p>
      </div>

      <CreatePodForm />

      {pods.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">No pods yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pods.map((pod) => (
            <PodCard key={pod.id} pod={pod} activeMembers={activeMembers} />
          ))}
        </div>
      )}
    </div>
  );
}
