import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ReactionButton } from "@/components/community/ReactionButton";
import { formatRelativeTime } from "@/lib/format";
import type { PostSummary } from "@/lib/community";

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-paper">
          {post.authorName}
        </span>
        <span className="text-xs text-stone">
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>
      <Link
        href={`/community/${post.id}`}
        className="block whitespace-pre-wrap text-sm text-paper/90 hover:text-paper"
      >
        {post.body}
      </Link>
      <div className="flex items-center gap-4 pt-1">
        <ReactionButton
          postId={post.id}
          count={post.reactionCount}
          hasReacted={post.hasReacted}
        />
        <Link
          href={`/community/${post.id}`}
          className="text-xs text-stone hover:text-paper"
        >
          {post.commentCount}{" "}
          {post.commentCount === 1 ? "comment" : "comments"}
        </Link>
      </div>
    </Card>
  );
}
