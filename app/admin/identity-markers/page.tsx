import { getIdentityMarkersAdmin } from "@/lib/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CreateIdentityMarkerForm } from "./CreateIdentityMarkerForm";
import { toggleIdentityMarkerActive } from "./actions";
import { cn } from "@/lib/cn";

export default async function AdminIdentityMarkersPage() {
  const markers = await getIdentityMarkersAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-paper">Identity Markers</h1>
        <p className="mt-1 text-sm text-stone">
          The archetypes new members choose from during onboarding.
        </p>
      </div>

      <CreateIdentityMarkerForm />

      {markers.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">No identity markers yet.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-md border border-line">
          <div className="divide-y divide-line">
            {markers.map((marker) => (
              <div
                key={marker.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm text-paper">{marker.name}</p>
                  {marker.description && (
                    <p className="text-xs text-stone">{marker.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(marker.isActive && "border-gold/40 text-gold")}
                  >
                    {marker.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <form
                    action={toggleIdentityMarkerActive.bind(
                      null,
                      marker.id,
                      !marker.isActive
                    )}
                  >
                    <button
                      type="submit"
                      className="text-xs text-stone transition-colors hover:text-danger"
                    >
                      {marker.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
