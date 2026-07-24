"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteURL } from "@/lib/site-url";

export type ProfileFormState = { error: string } | undefined;

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!displayName) {
    return { error: "Enter a display name." };
  }
  if (displayName.length > 60) {
    return { error: "Keep your display name under 60 characters." };
  }
  if (bio.length > 300) {
    return { error: "Keep your bio under 300 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, bio: bio || null })
    .eq("id", user.id);

  if (error) {
    return { error: "Could not update your profile. Try again." };
  }

  revalidatePath("/profile");
  revalidatePath("/members");
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export type AvatarFormState = { error: string } | undefined;

export async function uploadAvatar(
  _prevState: AvatarFormState,
  formData: FormData
): Promise<AvatarFormState> {
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return { error: "Avatars must be PNG, JPEG, or WEBP." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "Keep avatar images under 2MB." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const path = `${user.id}/avatar.${EXTENSION_BY_TYPE[file.type]}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { error: "Could not upload that image. Try again." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  // Cache-bust so the new image shows immediately instead of a stale CDN copy.
  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateError) {
    return { error: "Uploaded, but could not save your profile. Try again." };
  }

  revalidatePath("/profile");
  revalidatePath("/members");
}

// Upgrades a still-active anonymous session (V1 accounts) to a real,
// permanent identity in place — same user.id, so every habit/XP/post
// already on the account is preserved. An anonymous session that expires
// before this runs has no credential to log back in with and is
// unrecoverable; this is the only recovery window.
export type UpgradeAccountState = { error: string } | undefined;

export async function upgradeAccountWithPassword(
  _prevState: UpgradeAccountState,
  formData: FormData
): Promise<UpgradeAccountState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter an email and a password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
}

export async function upgradeAccountWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.linkIdentity({
    provider: "google",
    options: {
      redirectTo: new URL("/auth/callback?next=/profile", getSiteURL()).toString(),
    },
  });

  if (error || !data.url) {
    redirect("/profile?error=google_unavailable");
  }

  redirect(data.url);
}
