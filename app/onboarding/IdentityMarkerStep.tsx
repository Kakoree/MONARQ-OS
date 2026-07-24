"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { setIdentityMarker, type IdentityMarkerState } from "./actions";
import { cn } from "@/lib/cn";
import type { IdentityMarker } from "@/lib/identity-markers";

export function IdentityMarkerStep({ markers }: { markers: IdentityMarker[] }) {
  const [state, action, pending] = useActionState<IdentityMarkerState, FormData>(
    setIdentityMarker,
    undefined
  );

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-2">
        {markers.map((marker) => (
          <button
            key={marker.id}
            type="submit"
            name="marker"
            value={marker.name}
            disabled={pending}
            className={cn(
              "group rounded-md border border-line bg-surface px-4 py-3 text-left transition-colors",
              "hover:border-gold/60 disabled:pointer-events-none disabled:opacity-40"
            )}
          >
            <p className="text-sm font-medium text-paper group-hover:text-gold">
              {marker.name}
            </p>
            {marker.description && (
              <p className="mt-0.5 text-xs text-stone">{marker.description}</p>
            )}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {state?.error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-danger"
          >
            {state.error}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
