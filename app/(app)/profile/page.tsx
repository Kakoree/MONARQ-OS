import { getOwnProfile } from "@/lib/profile";
import { getChallenges } from "@/lib/challenges";
import { getOwnedDrops } from "@/lib/drops";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { TierBadge } from "@/components/ui/TierBadge";
import { MilestonesList } from "@/components/home/MilestonesList";
import { OwnedDropsList } from "@/components/profile/OwnedDropsList";
import { SecureAccountCard } from "@/components/profile/SecureAccountCard";
import { ProfileForm } from "./ProfileForm";
import { AvatarUploadForm } from "./AvatarUploadForm";

export default async function ProfilePage() {
  const [profile, challenges] = await Promise.all([getOwnProfile(), getChallenges()]);

  if (!profile) {
    return null;
  }

  const ownedDrops = await getOwnedDrops(profile.id);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Profile</h1>
        <p className="mt-1 text-sm text-stone">
          How you show up inside MONARQ.
        </p>
      </div>

      {profile.isAnonymous && <SecureAccountCard />}

      <Card className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar url={profile.avatarUrl} name={profile.displayName} size={64} />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg text-paper">
                {profile.displayName ?? "Member"}
              </p>
              <TierBadge tier={profile.seasonTier} />
            </div>
            <p className="text-xs uppercase tracking-wider text-stone">
              Level {profile.level} · {profile.totalXp} XP
              {profile.identityMarker && ` · ${profile.identityMarker}`}
            </p>
          </div>
        </div>
        <AvatarUploadForm />
      </Card>

      <Card>
        <ProfileForm
          displayName={profile.displayName ?? ""}
          bio={profile.bio ?? ""}
        />
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-wider text-stone">
          Milestones
        </p>
        <div className="mt-3">
          <MilestonesList challenges={challenges ?? []} />
        </div>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-wider text-stone">
          Owned drops
        </p>
        <div className="mt-3">
          <OwnedDropsList drops={ownedDrops} />
        </div>
      </Card>
    </div>
  );
}
