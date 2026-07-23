import { deletePost, deleteComment } from "../actions";

const buttonClass =
  "text-xs text-stone transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold";

export function DeletePostButton({ postId }: { postId: string }) {
  return (
    <form action={deletePost.bind(null, postId)}>
      <button type="submit" className={buttonClass}>
        Delete post
      </button>
    </form>
  );
}

export function DeleteCommentButton({
  commentId,
  postId,
}: {
  commentId: string;
  postId: string;
}) {
  return (
    <form action={deleteComment.bind(null, commentId, postId)}>
      <button type="submit" className={buttonClass}>
        Delete comment
      </button>
    </form>
  );
}
