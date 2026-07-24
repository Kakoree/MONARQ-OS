import Link from "next/link";
import { formatRelativeTime } from "@/lib/format";
import type { PostSummary } from "@/lib/community";

export function CommunityFeedPreview({ posts }: { posts: PostSummary[] }) {
  const recent = posts.slice(0, 3);

  if (recent.length === 0) {
    return (
      <p className="text-sm text-stone">
        No posts yet. Be the first to share something.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-1">
        {recent.map((post) => (
          <li key={post.id}>
            <Link
              href={`/community/${post.id}`}
              className="block rounded-md px-2 py-1.5 transition-colors hover:bg-surface-raised"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-paper">{post.authorName}</span>
                <span className="text-xs text-stone">
                  {formatRelativeTime(post.createdAt)}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-stone">{post.body}</p>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/community" className="block text-xs text-stone hover:text-paper">
        View community →
      </Link>
    </div>
  );
}
