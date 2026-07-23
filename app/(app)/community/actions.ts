"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type PostFormState = { error: string } | undefined;

export async function createPost(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    return { error: "Write something before posting." };
  }
  if (body.length > 2000) {
    return { error: "Keep posts under 2000 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("posts").insert({ user_id: user.id, body });

  if (error) {
    return { error: "Could not post that. Try again." };
  }

  revalidatePath("/community");
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("posts").delete().eq("id", postId).eq("user_id", user.id);

  revalidatePath("/community");
  redirect("/community");
}

export async function toggleReaction(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
  } else {
    await supabase.from("reactions").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
}

export async function addComment(
  postId: string,
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    return { error: "Write a comment first." };
  }
  if (body.length > 1000) {
    return { error: "Keep comments under 1000 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: user.id, body });

  if (error) {
    return { error: "Could not add that comment. Try again." };
  }

  revalidatePath(`/community/${postId}`);
  revalidatePath("/community");
}

export async function deleteComment(commentId: string, postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  revalidatePath(`/community/${postId}`);
  revalidatePath("/community");
}
