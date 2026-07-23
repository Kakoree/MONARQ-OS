import { getOwnProfile } from "@/lib/profile";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { ProfileForm } from "./ProfileForm";
import { AvatarUploadForm } from "./AvatarUploadForm";

export default async function ProfilePage() {
  const profile = await getOwnProfile();

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Profile</h1>
        <p className="mt-1 text-sm text-stone">
          How you show up inside MONARQ.
        </p>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar url={profile.avatarUrl} name={profile.displayName} size={64} />
          <div>
            <p className="text-lg text-paper">
              {profile.displayName ?? "Member"}
            </p>
            <p className="text-xs uppercase tracking-wider text-stone">
              Level {profile.level} · {profile.totalXp} XP
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
    </div>
  );
}
