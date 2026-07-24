import { getDrops } from "@/lib/drops";
import { Card } from "@/components/ui/Card";
import { DropCard } from "@/components/drops/DropCard";
import { Reveal } from "@/components/motion/Reveal";

export default async function DropsPage() {
  const drops = await getDrops();

  if (!drops) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Drops</h1>
        <p className="mt-1 text-sm text-stone">
          Jewelry and key drops from MONARQ.
        </p>
      </div>

      {drops.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">No drops available right now.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {drops.map((drop, index) => (
            <Reveal key={drop.id} delay={index * 0.04}>
              <DropCard drop={drop} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
