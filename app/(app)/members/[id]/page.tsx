import { notFound } from "next/navigation";
import { getMemberProfile } from "@/lib/profile";
import { getConnectionState } from "@/lib/connections";
import { getOwnedDrops } from "@/lib/drops";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { TierBadge } from "@/components/ui/TierBadge";
import { ConnectButton } from "@/components/members/ConnectButton";
import { ReportMemberForm } from "@/components/members/ReportMemberForm";
import { OwnedDropsList } from "@/components/profile/OwnedDropsList";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [member, { state: connectionState }] = await Promise.all([
    getMemberProfile(id),
    getConnectionState(id),
  ]);

  if (!member) {
    notFound();
  }

  const ownedDrops = await getOwnedDrops(id);

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
            <div className="flex items-center gap-2">
              <p className="text-lg text-paper">{member.displayName}</p>
              <TierBadge tier={member.seasonTier} />
            </div>
            <p className="text-xs uppercase tracking-wider text-stone">
              Level {member.level} · {member.totalXp} XP
              {member.identityMarker && ` · ${member.identityMarker}`}
            </p>
          </div>
        </div>
        {member.bio && <p className="text-sm text-stone">{member.bio}</p>}
        <div className="flex items-center justify-between pt-1">
          <ConnectButton recipientId={id} initialState={connectionState} />
          <ReportMemberForm reportedUserId={id} />
        </div>
      </Card>

      {ownedDrops.length > 0 && (
        <Card>
          <p className="text-xs uppercase tracking-wider text-stone">
            Owned drops
          </p>
          <div className="mt-3">
            <OwnedDropsList drops={ownedDrops} />
          </div>
        </Card>
      )}
    </div>
  );
}
