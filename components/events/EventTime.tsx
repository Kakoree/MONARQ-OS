"use client";

import { useSyncExternalStore } from "react";

// Renders in the viewer's local timezone. toLocaleString() differs between
// the server's timezone and the browser's, so this can't just be computed
// server-side — useSyncExternalStore lets it show a stable placeholder
// during SSR/hydration (getServerSnapshot) and swap to the real local time
// once mounted (getSnapshot), without a hydration mismatch or a manual
// setState-in-effect.
function subscribe() {
  return () => {};
}

function formatLocal(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EventTime({ iso }: { iso: string }) {
  const display = useSyncExternalStore(
    subscribe,
    () => formatLocal(iso),
    () => "…"
  );

  return <span>{display}</span>;
}
