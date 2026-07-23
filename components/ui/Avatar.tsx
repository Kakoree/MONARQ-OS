import Image from "next/image";
import { cn } from "@/lib/cn";

export function Avatar({
  url,
  name,
  size = 40,
  className,
}: {
  url: string | null;
  name: string | null;
  size?: number;
  className?: string;
}) {
  const initial = (name?.trim()?.[0] ?? "M").toUpperCase();

  if (url) {
    return (
      <Image
        src={url}
        alt={name ?? "Member avatar"}
        width={size}
        height={size}
        className={cn(
          "rounded-full border border-line object-cover",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border border-line bg-surface-raised font-display text-gold",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
