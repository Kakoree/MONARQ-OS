export type NavItem = {
  label: string;
  href: string;
  enabled: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/home", enabled: true },
  { label: "Teachings", href: "/teachings", enabled: true },
  { label: "Community", href: "/community", enabled: true },
  { label: "Challenges", href: "/challenges", enabled: true },
  { label: "Events", href: "/events", enabled: true },
  { label: "Drops", href: "/drops", enabled: true },
  { label: "Members", href: "/members", enabled: true },
  { label: "Circle", href: "/circle", enabled: true },
  { label: "Leaderboard", href: "/leaderboard", enabled: true },
  { label: "Discipline Schedule", href: "/discipline", enabled: false },
  { label: "Profile", href: "/profile", enabled: true },
];
