import { getOwnMentorStatus } from "@/lib/mentors";
import { Card } from "@/components/ui/Card";
import { ApplyForm } from "./ApplyForm";
import { EditMentorProfileForm } from "./EditMentorProfileForm";

export default async function MentorApplyPage() {
  const status = await getOwnMentorStatus();

  if (!status) {
    return null;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl text-paper">Mentor Profile</h1>
        <p className="mt-1 text-sm text-stone">
          Guide a track, hold office hours, pass on what you&apos;ve earned.
        </p>
      </div>

      {status.state === "not_applied" && (
        <Card>
          <ApplyForm />
        </Card>
      )}

      {status.state === "pending" && (
        <Card>
          <p className="text-sm text-paper">
            Your mentor application is under review.
          </p>
          <p className="mt-1 text-xs text-stone">
            An admin will approve it before you appear in the mentor
            directory.
          </p>
        </Card>
      )}

      {status.state === "approved" && (
        <Card>
          <EditMentorProfileForm
            headline={status.headline}
            bio={status.bio}
            focusAreas={status.focusAreas}
            isAcceptingRequests={status.isAcceptingRequests}
          />
        </Card>
      )}
    </div>
  );
}
