import { createClient } from "@/lib/supabase/server";

const FEED_LIMIT = 50;

export type PostSummary = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  reactionCount: number;
  hasReacted: boolean;
  commentCount: number;
};

export async function getFeed(): Promise<PostSummary[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: posts } = await supabase
    .from("posts")
    .select("id, user_id, body, created_at")
    .order("created_at", { ascending: false })
    .limit(FEED_LIMIT);

  if (!posts || posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);
  const authorIds = Array.from(new Set(posts.map((p) => p.user_id)));

  const [{ data: profiles }, { data: reactions }, { data: comments }] =
    await Promise.all([
      supabase.from("profiles").select("id, display_name").in("id", authorIds),
      supabase.from("reactions").select("post_id, user_id").in("post_id", postIds),
      supabase.from("comments").select("id, post_id").in("post_id", postIds),
    ]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  const reactionCounts = new Map<string, number>();
  const ownReactions = new Set<string>();
  for (const r of reactions ?? []) {
    reactionCounts.set(r.post_id, (reactionCounts.get(r.post_id) ?? 0) + 1);
    if (r.user_id === user.id) ownReactions.add(r.post_id);
  }

  const commentCounts = new Map<string, number>();
  for (const c of comments ?? []) {
    commentCounts.set(c.post_id, (commentCounts.get(c.post_id) ?? 0) + 1);
  }

  return posts.map((p) => ({
    id: p.id,
    authorId: p.user_id,
    authorName: nameById.get(p.user_id) ?? "Member",
    body: p.body,
    createdAt: p.created_at,
    reactionCount: reactionCounts.get(p.id) ?? 0,
    hasReacted: ownReactions.has(p.id),
    commentCount: commentCounts.get(p.id) ?? 0,
  }));
}

export type CommentItem = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type PostDetail = PostSummary & {
  comments: CommentItem[];
};

export async function getPost(id: string): Promise<PostDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: post } = await supabase
    .from("posts")
    .select("id, user_id, body, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!post) return null;

  const [{ data: comments }, { data: reactions }] = await Promise.all([
    supabase
      .from("comments")
      .select("id, user_id, body, created_at")
      .eq("post_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("reactions").select("user_id").eq("post_id", id),
  ]);

  const authorIds = Array.from(
    new Set([post.user_id, ...(comments ?? []).map((c) => c.user_id)])
  );
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", authorIds);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  return {
    id: post.id,
    authorId: post.user_id,
    authorName: nameById.get(post.user_id) ?? "Member",
    body: post.body,
    createdAt: post.created_at,
    reactionCount: (reactions ?? []).length,
    hasReacted: (reactions ?? []).some((r) => r.user_id === user.id),
    commentCount: (comments ?? []).length,
    comments: (comments ?? []).map((c) => ({
      id: c.id,
      authorId: c.user_id,
      authorName: nameById.get(c.user_id) ?? "Member",
      body: c.body,
      createdAt: c.created_at,
    })),
  };
}
