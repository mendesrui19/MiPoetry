import type { SupabaseClient } from "@supabase/supabase-js";
import type { FontSize, FontStyle, Privacy, ThemeStyle, BookSection, BookSectionType } from "@/lib/types";
import { isRichBody } from "@/lib/rich-text";
import {
  mapBookmark,
  mapCollection,
  mapComment,
  mapDraft,
  mapDraftVersion,
  mapFollow,
  mapNotification,
  mapPoem,
  mapProfile,
  mapReaction,
  mapBook,
  mapBookSection,
} from "./mappers";

export async function checkUsernameAvailable(
  supabase: SupabaseClient,
  username: string
) {
  const normalized = username.trim().toLowerCase();
  if (!normalized) return false;
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", normalized)
    .maybeSingle();
  if (error) throw error;
  return !data;
}

export async function insertNotificationRemote(
  supabase: SupabaseClient,
  notification: {
    id: string;
    userId: string;
    actorId: string;
    type: string;
    poemId?: string;
    commentId?: string;
  }
) {
  const { error } = await supabase.from("notifications").insert({
    id: notification.id,
    user_id: notification.userId,
    actor_id: notification.actorId,
    type: notification.type,
    poem_id: notification.poemId ?? null,
    comment_id: notification.commentId ?? null,
    read: false,
  });
  if (error) throw error;
}

export async function fetchPublicData(supabase: SupabaseClient) {
  const [profilesRes, poemsRes, followsRes, reactionsRes, commentsRes, booksRes] =
    await Promise.all([
      supabase.from("profiles").select("*").order("created_at"),
      supabase
        .from("poems")
        .select("*")
        .eq("privacy", "public")
        .order("created_at", { ascending: false }),
      supabase.from("follows").select("*"),
      supabase.from("reactions").select("*"),
      supabase.from("comments").select("*").order("created_at"),
      supabase
        .from("books")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false }),
    ]);

  const errors = [
    profilesRes.error,
    poemsRes.error,
    followsRes.error,
    reactionsRes.error,
    commentsRes.error,
    booksRes.error,
  ].filter(Boolean);

  if (errors.length) {
    throw errors[0];
  }

  const bookIds = (booksRes.data ?? []).map((b) => b.id);
  const bookPoemsRes =
    bookIds.length > 0
      ? await supabase
          .from("book_poems")
          .select("*")
          .in("book_id", bookIds)
          .order("position")
      : { data: [], error: null };

  if (bookPoemsRes.error) throw bookPoemsRes.error;

  const poemIdsByBook = new Map<string, string[]>();
  for (const row of bookPoemsRes.data ?? []) {
    const list = poemIdsByBook.get(row.book_id) ?? [];
    list.push(row.poem_id);
    poemIdsByBook.set(row.book_id, list);
  }

  const sectionsByBook = await fetchBookSectionsByBookIds(supabase, bookIds);

  return {
    users: (profilesRes.data ?? []).map(mapProfile),
    poems: (poemsRes.data ?? []).map(mapPoem),
    follows: (followsRes.data ?? []).map(mapFollow),
    reactions: (reactionsRes.data ?? []).map(mapReaction),
    comments: (commentsRes.data ?? []).map(mapComment),
    drafts: [],
    bookmarkCollections: [],
    bookmarks: [],
    books: (booksRes.data ?? []).map((b) =>
      mapBook(b, poemIdsByBook.get(b.id) ?? [], sectionsByBook.get(b.id) ?? [])
    ),
  };
}

async function fetchBookSectionsByBookIds(
  supabase: SupabaseClient,
  bookIds: string[]
) {
  const map = new Map<string, BookSection[]>();
  if (bookIds.length === 0) return map;

  const { data, error } = await supabase
    .from("book_sections")
    .select("*")
    .in("book_id", bookIds)
    .order("position");

  if (error) throw error;

  for (const row of data ?? []) {
    const section = mapBookSection(row);
    const list = map.get(section.bookId) ?? [];
    list.push(section);
    map.set(section.bookId, list);
  }

  return map;
}

export async function fetchAllData(supabase: SupabaseClient, userId: string) {
  const [
    profilesRes,
    poemsRes,
    draftsRes,
    followsRes,
    reactionsRes,
    commentsRes,
    collectionsRes,
    notificationsRes,
    draftVersionsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("poems").select("*").order("created_at", { ascending: false }),
    supabase.from("drafts").select("*").eq("author_id", userId),
    supabase.from("follows").select("*"),
    supabase.from("reactions").select("*"),
    supabase.from("comments").select("*").order("created_at"),
    supabase.from("bookmark_collections").select("*").eq("user_id", userId),
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("draft_versions")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const collectionIds = (collectionsRes.data ?? []).map((c) => c.id);
  const bookmarksRes =
    collectionIds.length > 0
      ? await supabase.from("bookmarks").select("*").in("collection_id", collectionIds)
      : { data: [], error: null };

  const booksRes = await supabase
    .from("books")
    .select("*")
    .or(`author_id.eq.${userId},is_public.eq.true`)
    .order("created_at", { ascending: false });

  const bookIds = (booksRes.data ?? []).map((b) => b.id);
  const bookPoemsRes =
    bookIds.length > 0
      ? await supabase
          .from("book_poems")
          .select("*")
          .in("book_id", bookIds)
          .order("position")
      : { data: [], error: null };

  const poemIdsByBook = new Map<string, string[]>();
  for (const row of bookPoemsRes.data ?? []) {
    const list = poemIdsByBook.get(row.book_id) ?? [];
    list.push(row.poem_id);
    poemIdsByBook.set(row.book_id, list);
  }

  const sectionsByBook = await fetchBookSectionsByBookIds(supabase, bookIds);

  const errors = [
    profilesRes.error,
    poemsRes.error,
    draftsRes.error,
    followsRes.error,
    reactionsRes.error,
    commentsRes.error,
    collectionsRes.error,
    bookmarksRes.error,
    booksRes.error,
    bookPoemsRes.error,
    notificationsRes.error,
    draftVersionsRes.error,
  ].filter(Boolean);

  if (errors.length) {
    throw errors[0];
  }

  return {
    users: (profilesRes.data ?? []).map(mapProfile),
    poems: (poemsRes.data ?? []).map(mapPoem),
    drafts: (draftsRes.data ?? []).map(mapDraft),
    follows: (followsRes.data ?? []).map(mapFollow),
    reactions: (reactionsRes.data ?? []).map(mapReaction),
    comments: (commentsRes.data ?? []).map(mapComment),
    bookmarkCollections: (collectionsRes.data ?? []).map(mapCollection),
    bookmarks: (bookmarksRes.data ?? []).map(mapBookmark),
    books: (booksRes.data ?? []).map((b) =>
      mapBook(b, poemIdsByBook.get(b.id) ?? [], sectionsByBook.get(b.id) ?? [])
    ),
    notifications: (notificationsRes.data ?? []).map(mapNotification),
    draftVersions: (draftVersionsRes.data ?? []).map(mapDraftVersion),
  };
}

export async function upsertPoem(
  supabase: SupabaseClient,
  authorId: string,
  data: {
    id?: string;
    title: string;
    body: string;
    font: FontStyle;
    theme: ThemeStyle;
    textColor?: string;
    fontSize?: FontSize;
    privacy: Privacy;
    hashtags: string[];
  }
) {
  const payload = {
    author_id: authorId,
    title: data.title.trim() || "Sem título",
    body: isRichBody(data.body) ? data.body : data.body.trim(),
    font: data.font,
    theme: data.theme,
    text_color: data.textColor,
    font_size: data.fontSize,
    privacy: data.privacy,
    hashtags: data.hashtags,
  };

  if (data.id) {
    const { data: row, error } = await supabase
      .from("poems")
      .update(payload)
      .eq("id", data.id)
      .eq("author_id", authorId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (row) return mapPoem(row);
  }

  const { data: row, error } = await supabase
    .from("poems")
    .insert({ ...payload, ...(data.id ? { id: data.id } : {}) })
    .select("*")
    .single();
  if (error) throw error;
  return mapPoem(row);
}

export async function deletePoemRemote(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("poems").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertDraft(
  supabase: SupabaseClient,
  authorId: string,
  data: {
    id?: string;
    title: string;
    body: string;
    font: FontStyle;
    theme: ThemeStyle;
    textColor?: string;
    fontSize?: FontSize;
    privacy: Privacy;
    hashtags: string[];
  }
) {
  const payload = {
    author_id: authorId,
    title: data.title,
    body: data.body,
    font: data.font,
    theme: data.theme,
    text_color: data.textColor,
    font_size: data.fontSize,
    privacy: data.privacy,
    hashtags: data.hashtags,
    updated_at: new Date().toISOString(),
  };

  if (data.id) {
    const { data: row, error } = await supabase
      .from("drafts")
      .update(payload)
      .eq("id", data.id)
      .eq("author_id", authorId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (row) return mapDraft(row);
  }

  const { data: row, error } = await supabase
    .from("drafts")
    .insert({ ...payload, ...(data.id ? { id: data.id } : {}) })
    .select("*")
    .single();
  if (error) throw error;
  return mapDraft(row);
}

export async function deleteDraftRemote(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("drafts").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteDraftByIdAfterPublish(
  supabase: SupabaseClient,
  draftId: string
) {
  await supabase.from("drafts").delete().eq("id", draftId);
}

export async function updateProfileRemote(
  supabase: SupabaseClient,
  userId: string,
  data: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    styleTags?: string[];
    pinnedPoemIds?: string[];
  }
) {
  const payload: Record<string, unknown> = {};
  if (data.displayName !== undefined) payload.display_name = data.displayName;
  if (data.bio !== undefined) payload.bio = data.bio;
  if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl;
  if (data.styleTags !== undefined) payload.style_tags = data.styleTags;
  if (data.pinnedPoemIds !== undefined) payload.pinned_poem_ids = data.pinnedPoemIds;

  const { data: row, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return mapProfile(row);
}

export async function toggleFollowRemote(
  supabase: SupabaseClient,
  followerId: string,
  followingId: string,
  follow: boolean
) {
  if (follow) {
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: followerId, following_id: followingId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);
    if (error) throw error;
  }
}

export async function toggleReactionRemote(
  supabase: SupabaseClient,
  userId: string,
  poemId: string,
  type: "applause" | "snap",
  remove: boolean
) {
  if (remove) {
    await supabase.from("reactions").delete().eq("user_id", userId).eq("poem_id", poemId);
  } else {
    await supabase
      .from("reactions")
      .upsert({ user_id: userId, poem_id: poemId, type }, { onConflict: "user_id,poem_id" });
  }
}

export async function addCommentRemote(
  supabase: SupabaseClient,
  authorId: string,
  poemId: string,
  body: string,
  id?: string
) {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      author_id: authorId,
      poem_id: poemId,
      body,
      ...(id ? { id } : {}),
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapComment(data);
}

export async function deleteCommentRemote(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}

export async function setBookmarkRemote(
  supabase: SupabaseClient,
  collectionId: string,
  poemId: string,
  remove: boolean
) {
  if (remove) {
    await supabase
      .from("bookmarks")
      .delete()
      .eq("collection_id", collectionId)
      .eq("poem_id", poemId);
  } else {
    await supabase.from("bookmarks").upsert(
      { collection_id: collectionId, poem_id: poemId },
      { onConflict: "collection_id,poem_id" }
    );
  }
}

export async function incrementViewRemote(supabase: SupabaseClient, poemId: string) {
  const { error } = await supabase.rpc("increment_poem_view", { poem_id: poemId });
  if (error) throw error;
}

export async function upsertBookRemote(
  supabase: SupabaseClient,
  authorId: string,
  data: {
    id?: string;
    title: string;
    description: string;
    slug: string;
    coverUrl?: string;
    isPublic: boolean;
    poemIds?: string[];
  }
) {
  const payload = {
    author_id: authorId,
    title: data.title,
    description: data.description,
    slug: data.slug,
    cover_url: data.coverUrl ?? null,
    is_public: data.isPublic,
    updated_at: new Date().toISOString(),
  };

  let bookId = data.id;
  if (data.id) {
    const { data: row, error } = await supabase
      .from("books")
      .update(payload)
      .eq("id", data.id)
      .eq("author_id", authorId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (row) bookId = row.id;
  } else {
    const { data: row, error } = await supabase
      .from("books")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    bookId = row.id;
  }

  if (data.poemIds && bookId) {
    await updateBookPoemsOrder(supabase, bookId, data.poemIds);
  }

  const { data: book, error: fetchError } = await supabase
    .from("books")
    .select("*")
    .eq("id", bookId!)
    .single();
  if (fetchError) throw fetchError;

  const { data: bookPoems } = await supabase
    .from("book_poems")
    .select("poem_id")
    .eq("book_id", bookId!)
    .order("position");

  return mapBook(
    book,
    (bookPoems ?? []).map((r) => r.poem_id)
  );
}

export async function updateBookPoemsOrder(
  supabase: SupabaseClient,
  bookId: string,
  poemIds: string[]
) {
  const { error: deleteError } = await supabase
    .from("book_poems")
    .delete()
    .eq("book_id", bookId);
  if (deleteError) throw deleteError;

  if (poemIds.length === 0) return;

  const { error: insertError } = await supabase.from("book_poems").insert(
    poemIds.map((poem_id, position) => ({
      book_id: bookId,
      poem_id,
      position,
    }))
  );
  if (insertError) throw insertError;
}

export async function fetchBookBySlug(supabase: SupabaseClient, slug: string) {
  const { data: book, error } = await supabase
    .from("books")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!book) return null;

  const { data: bookPoems, error: bpError } = await supabase
    .from("book_poems")
    .select("poem_id")
    .eq("book_id", book.id)
    .order("position");
  if (bpError) throw bpError;

  const { data: sections, error: sectionsError } = await supabase
    .from("book_sections")
    .select("*")
    .eq("book_id", book.id)
    .order("position");
  if (sectionsError) throw sectionsError;

  return mapBook(
    book,
    (bookPoems ?? []).map((r) => r.poem_id),
    (sections ?? []).map(mapBookSection)
  );
}

export async function upsertBookSectionRemote(
  supabase: SupabaseClient,
  data: {
    id?: string;
    bookId: string;
    type: BookSectionType;
    title?: string;
    body: string;
    placement: "front" | "back";
    position: number;
  }
) {
  const payload = {
    book_id: data.bookId,
    section_type: data.type,
    title: data.title ?? null,
    body: data.body,
    placement: data.placement,
    position: data.position,
  };

  if (data.id) {
    const { data: row, error } = await supabase
      .from("book_sections")
      .update(payload)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw error;
    return mapBookSection(row);
  }

  const { data: row, error } = await supabase
    .from("book_sections")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return mapBookSection(row);
}

export async function deleteBookSectionRemote(
  supabase: SupabaseClient,
  sectionId: string
) {
  const { error } = await supabase.from("book_sections").delete().eq("id", sectionId);
  if (error) throw error;
}

export async function reorderBookSectionsRemote(
  supabase: SupabaseClient,
  bookId: string,
  placement: "front" | "back",
  sectionIds: string[]
) {
  await Promise.all(
    sectionIds.map((id, position) =>
      supabase
        .from("book_sections")
        .update({ position })
        .eq("id", id)
        .eq("book_id", bookId)
        .eq("placement", placement)
    )
  );
}

export async function fetchNotifications(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapNotification);
}

export async function markNotificationRead(
  supabase: SupabaseClient,
  notificationId: string,
  userId: string
) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function markAllNotificationsRead(
  supabase: SupabaseClient,
  userId: string
) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
}

export async function insertDraftVersion(
  supabase: SupabaseClient,
  authorId: string,
  data: {
    id?: string;
    draftId: string;
    title: string;
    body: string;
    font: FontStyle;
    theme: ThemeStyle;
    textColor?: string;
    fontSize?: FontSize;
    label?: string;
  }
) {
  const { data: row, error } = await supabase
    .from("draft_versions")
    .insert({
      author_id: authorId,
      draft_id: data.draftId,
      title: data.title,
      body: data.body,
      font: data.font,
      theme: data.theme,
      text_color: data.textColor,
      font_size: data.fontSize,
      label: data.label,
      ...(data.id ? { id: data.id } : {}),
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapDraftVersion(row);
}

export async function fetchDraftVersions(
  supabase: SupabaseClient,
  draftId: string,
  authorId: string
) {
  const { data, error } = await supabase
    .from("draft_versions")
    .select("*")
    .eq("draft_id", draftId)
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapDraftVersion);
}

export async function updatePoemAudioUrl(
  supabase: SupabaseClient,
  poemId: string,
  authorId: string,
  audioUrl: string | null
) {
  const { data: row, error } = await supabase
    .from("poems")
    .update({ audio_url: audioUrl })
    .eq("id", poemId)
    .eq("author_id", authorId)
    .select("*")
    .single();
  if (error) throw error;
  return mapPoem(row);
}
