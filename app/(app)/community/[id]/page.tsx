import { notFound } from "next/navigation";
import { getPost } from "@/lib/community";
import { getCurrentMembership } from "@/lib/membership";
import { Card } from "@/components/ui/Card";
import { ReactionButton } from "@/components/community/ReactionButton";
import { formatRelativeTime } from "@/lib/format";
import { AddCommentForm } from "./AddCommentForm";
import { DeletePostButton, DeleteCommentButton } from "./ActionButtons";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, { user }] = await Promise.all([
    getPost(id),
    getCurrentMembership(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="space-y-3">
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
        <div className="flex items-center justify-between pt-1">
          <ReactionButton
            postId={post.id}
            count={post.reactionCount}
            hasReacted={post.hasReacted}
          />
          {post.authorId === user?.id && (
            <DeletePostButton postId={post.id} />
          )}
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
          {post.commentCount}{" "}
          {post.commentCount === 1 ? "Comment" : "Comments"}
        </h2>

        {post.comments.length > 0 && (
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <Card key={comment.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-paper">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-stone">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-paper/90">
                  {comment.body}
                </p>
                {comment.authorId === user?.id && (
                  <DeleteCommentButton
                    commentId={comment.id}
                    postId={post.id}
                  />
                )}
              </Card>
            ))}
          </div>
        )}

        <AddCommentForm postId={post.id} />
      </div>
    </div>
  );
}
