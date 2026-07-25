import { getTeachingCategoriesAdmin, getTeachingsAdmin, getMentorsAdmin } from "@/lib/admin";
import type { AdminTeaching } from "@/lib/admin";
import { Card } from "@/components/ui/Card";
import { CreateTeachingCategoryForm } from "./CreateTeachingCategoryForm";
import { TeachingCategoryRow } from "./TeachingCategoryRow";
import { CreateTeachingForm } from "./CreateTeachingForm";
import { TeachingRow } from "./TeachingRow";

export default async function AdminTeachingsPage() {
  const [categories, teachings, mentors] = await Promise.all([
    getTeachingCategoriesAdmin(),
    getTeachingsAdmin(),
    getMentorsAdmin(),
  ]);

  const approvedMentors = mentors
    .filter((m) => m.isApproved)
    .map((m) => ({ id: m.id, displayName: m.displayName }));

  const teachingsByCategory = new Map<string | null, AdminTeaching[]>();
  for (const teaching of teachings) {
    const key = teaching.categoryId;
    teachingsByCategory.set(key, [...(teachingsByCategory.get(key) ?? []), teaching]);
  }
  const uncategorized = teachingsByCategory.get(null) ?? [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl text-paper">Teachings</h1>
        <p className="mt-1 text-sm text-stone">
          Tracks group teachings into a progressive sequence — a member
          unlocks the next teaching in a track only after completing the
          previous one, in addition to any required-role gate. Assign a
          mentor to a track to credit them as its lead.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">Tracks</h2>
        <CreateTeachingCategoryForm mentors={approvedMentors} />
        {categories.length === 0 ? (
          <Card>
            <p className="text-sm text-stone">No tracks yet.</p>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-md border border-line">
            <div className="divide-y divide-line">
              {categories.map((category) => (
                <TeachingCategoryRow
                  key={category.id}
                  category={category}
                  mentors={approvedMentors}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">Teachings</h2>
        <CreateTeachingForm categories={categories} />
        {teachings.length === 0 ? (
          <Card>
            <p className="text-sm text-stone">No teachings yet.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => {
              const inTrack = teachingsByCategory.get(category.id) ?? [];
              if (inTrack.length === 0) return null;
              return (
                <div key={category.id} className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-stone/70">
                    {category.name}
                  </p>
                  <div className="overflow-hidden rounded-md border border-line">
                    <div className="divide-y divide-line">
                      {inTrack.map((teaching) => (
                        <TeachingRow
                          key={teaching.id}
                          teaching={teaching}
                          categories={categories}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            {uncategorized.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-stone/70">Uncategorized</p>
                <div className="overflow-hidden rounded-md border border-line">
                  <div className="divide-y divide-line">
                    {uncategorized.map((teaching) => (
                      <TeachingRow
                        key={teaching.id}
                        teaching={teaching}
                        categories={categories}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
