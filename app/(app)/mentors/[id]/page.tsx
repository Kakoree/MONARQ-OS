import { notFound } from "next/navigation";
import { getMentorProfile } from "@/lib/mentors";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { RequestMentorshipForm } from "@/components/mentors/RequestMentorshipForm";

export default async function MentorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mentor = await getMentorProfile(id);

  if (!mentor) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar url={mentor.avatarUrl} name={mentor.displayName} size={64} />
          <div>
            <p className="text-lg text-paper">{mentor.displayName}</p>
            <p className="text-sm text-stone">{mentor.headline}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {mentor.focusAreas.map((area) => (
            <Badge key={area}>{area}</Badge>
          ))}
        </div>
        <p className="text-sm text-paper/90">{mentor.bio}</p>
      </Card>

      <Card>
        {mentor.isAcceptingRequests ? (
          <RequestMentorshipForm mentorId={mentor.id} />
        ) : (
          <p className="text-sm text-stone">
            {mentor.displayName} isn&apos;t accepting mentorship requests right
            now.
          </p>
        )}
      </Card>
    </div>
  );
}
