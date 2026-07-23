import { notFound } from "next/navigation";
import { getMemberProfile } from "@/lib/profile";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMemberProfile(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar
            url={member.avatarUrl}
            name={member.displayName}
            size={64}
          />
          <div>
            <p className="text-lg text-paper">{member.displayName}</p>
            <p className="text-xs uppercase tracking-wider text-stone">
              Level {member.level} · {member.totalXp} XP
            </p>
          </div>
        </div>
        {member.bio && <p className="text-sm text-stone">{member.bio}</p>}
      </Card>
    </div>
  );
}
