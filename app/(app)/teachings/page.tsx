import Link from "next/link";
import { getTeachingsLibrary } from "@/lib/teachings";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function TeachingsPage() {
  const groups = await getTeachingsLibrary();

  if (!groups) {
    return null;
  }

  const allTeachings = groups.flatMap((g) => g.teachings);
  const recommended = allTeachings.find((t) => t.isUnlocked && !t.isCompleted);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Teachings</h1>
        <p className="mt-1 text-sm text-stone">
          Structured knowledge for building discipline, taste, and strength.
        </p>
      </div>

      {recommended && (
        <Link href={`/teachings/${recommended.id}`}>
          <Card className="border-gold/40 transition-colors hover:border-gold/70">
            <p className="text-xs uppercase tracking-wider text-gold">
              Continue
            </p>
            <p className="mt-2 text-lg text-paper">{recommended.title}</p>
            <p className="mt-1 text-sm text-stone">{recommended.summary}</p>
          </Card>
        </Link>
      )}

      {groups.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">
            No teachings are available yet.
          </p>
        </Card>
      ) : (
        groups.map((group) => (
          <div key={group.id ?? "general"} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
                {group.name}
              </h2>
              {group.mentorName && (
                <Badge className="border-gold/40 text-gold">
                  Mentor-led · {group.mentorName}
                </Badge>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.teachings.map((t) =>
                t.isUnlocked ? (
                  <Link key={t.id} href={`/teachings/${t.id}`}>
                    <Card className="h-full transition-colors hover:border-gold/40">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-paper">
                          {t.title}
                        </p>
                        {t.isCompleted && (
                          <Badge className="border-gold/40 text-gold">
                            Done
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-stone">{t.summary}</p>
                    </Card>
                  </Link>
                ) : (
                  <Card key={t.id} className="h-full opacity-60">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-paper">
                        {t.title}
                      </p>
                      <Badge>Locked</Badge>
                    </div>
                    <p className="mt-2 text-sm text-stone">{t.summary}</p>
                    <p className="mt-2 text-xs text-stone">
                      {!t.roleUnlocked
                        ? "Unlocks at a higher membership level."
                        : "Complete the previous teaching in this track first."}
                    </p>
                  </Card>
                )
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
