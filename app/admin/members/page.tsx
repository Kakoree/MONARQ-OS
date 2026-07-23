import { getAllMembers, requireAdmin } from "@/lib/admin";
import { MemberRow } from "./MemberRow";

export default async function AdminMembersPage() {
  const admin = await requireAdmin();
  const members = await getAllMembers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-paper">Members</h1>
        <p className="mt-1 text-sm text-stone">{members.length} total</p>
      </div>
      <div className="overflow-hidden rounded-md border border-line">
        <div className="divide-y divide-line">
          {members.map((member) => (
            <MemberRow
              key={member.userId}
              member={member}
              isSelf={member.userId === admin.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
