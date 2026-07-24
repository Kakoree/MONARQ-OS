import Link from "next/link";
import { buttonClassName } from "@/components/ui/buttonClassName";

export function WelcomeStep({ identityMarker }: { identityMarker: string }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-stone">
        You&apos;re in as a <span className="text-gold">{identityMarker}</span>.
        Your first habit is live and the club just saw you walk in.
      </p>
      <Link href="/" className={buttonClassName("primary", "w-full")}>
        Enter MONARQ
      </Link>
    </div>
  );
}
