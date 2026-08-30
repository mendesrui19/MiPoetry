import type { SupabaseClient } from "@supabase/supabase-js";
import { resizeImageFile } from "@/lib/image-resize";

export async function uploadAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<string> {
  const resized = await resizeImageFile(file);
  const path = `${userId}/avatar.jpg`;

  const { error } = await supabase.storage.from("avatars").upload(path, resized, {
    upsert: true,
    contentType: "image/jpeg",
    cacheControl: "3600",
  });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function uploadBookCover(
  supabase: SupabaseClient,
  userId: string,
  bookId: string,
  file: File
): Promise<string> {
  const resized = await resizeImageFile(file, 1200);
  const path = `${userId}/${bookId}/cover.jpg`;

  const { error } = await supabase.storage.from("book-covers").upload(path, resized, {
    upsert: true,
    contentType: "image/jpeg",
    cacheControl: "3600",
  });

  if (error) throw error;

  const { data } = supabase.storage.from("book-covers").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

