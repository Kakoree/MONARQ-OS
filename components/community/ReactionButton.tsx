import { toggleReaction } from "@/app/(app)/community/actions";
import { cn } from "@/lib/cn";

export function ReactionButton({
  postId,
  count,
  hasReacted,
}: {
  postId: string;
  count: number;
  hasReacted: boolean;
}) {
  return (
    <form action={toggleReaction.bind(null, postId)}>
      <button
        type="submit"
        aria-pressed={hasReacted}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
          hasReacted
            ? "border-gold bg-gold-dim text-gold"
            : "border-line text-stone hover:border-gold/60 hover:text-gold"
        )}
      >
        <span aria-hidden>✦</span>
        <span>{count}</span>
      </button>
    </form>
  );
}
