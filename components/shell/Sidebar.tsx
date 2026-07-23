import { NavList } from "./NavList";

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-shrink-0 md:flex-col md:border-r md:border-line md:bg-surface">
      <div className="px-6 py-8">
        <span className="font-display text-xl tracking-[0.2em] text-paper">
          MONARQ
        </span>
      </div>
      <div className="flex-1 px-3">
        <NavList orientation="vertical" />
      </div>
    </aside>
  );
}
