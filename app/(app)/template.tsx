import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion/PageTransition";

export default function AppTemplate({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
