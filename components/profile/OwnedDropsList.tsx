import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { OwnedDrop } from "@/lib/drops";

export function OwnedDropsList({ drops }: { drops: OwnedDrop[] }) {
  if (drops.length === 0) {
    return <p className="text-sm text-stone">No drops claimed yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {drops.map((drop) => (
        <Link key={drop.dropId} href={`/drops/${drop.dropId}`}>
          <Badge className="border-gold/40 text-gold hover:bg-gold-dim">
            {drop.title}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
