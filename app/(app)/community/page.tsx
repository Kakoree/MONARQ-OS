import { getFeed } from "@/lib/community";
import { Card } from "@/components/ui/Card";
import { PostCard } from "@/components/community/PostCard";
import { CreatePostForm } from "./CreatePostForm";

export default async function CommunityPage() {
  const posts = await getFeed();

  if (!posts) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Community</h1>
        <p className="mt-1 text-sm text-stone">
          Share wins, reflections, and progress with the club.
        </p>
      </div>

      <CreatePostForm />

      {posts.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">
            No posts yet. Be the first to share something.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
