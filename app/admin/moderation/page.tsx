import { getFeed } from "@/lib/community";
import { Card } from "@/components/ui/Card";
import { formatRelativeTime } from "@/lib/format";
import { removePost } from "./actions";

export default async function AdminModerationPage() {
  const posts = await getFeed();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-paper">Moderation</h1>
        <p className="mt-1 text-sm text-stone">
          Most recent community posts — remove anything that shouldn&apos;t
          be there.
        </p>
      </div>

      {!posts || posts.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">No posts yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-paper">
                  {post.authorName}
                </span>
                <span className="text-xs text-stone">
                  {formatRelativeTime(post.createdAt)}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-paper/90">
                {post.body}
              </p>
              <form action={removePost.bind(null, post.id)}>
                <button
                  type="submit"
                  className="text-xs text-stone transition-colors hover:text-danger"
                >
                  Remove post
                </button>
              </form>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
