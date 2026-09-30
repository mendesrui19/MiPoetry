import type { SupabaseClient } from "@supabase/supabase-js";
import type { FontSize, FontStyle, Privacy, ThemeStyle, BookSection, BookSectionType } from "@/lib/types";
import { isRichBody } from "@/lib/rich-text";
import type { CollaborativePoem, Conversation, Message } from "@/lib/types";
import {
  mapBookmark,
  mapCollection,
  mapCollaborativePoem,
  mapComment,
  mapConversation,
  mapDraft,
  mapDraftVersion,
  mapFollow,
  mapMessage,
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
  const trendingHashtags = await fetchTrendingHashtags(supabase);
  const messaging = await fetchMessagingData(supabase, null);

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
    trendingHashtags,
    ...messaging,
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

  const trendingHashtags = await fetchTrendingHashtags(supabase);
  const messaging = await fetchMessagingData(supabase, userId);

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
    trendingHashtags,
    ...messaging,
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

export async function fetchTrendingHashtags(supabase: SupabaseClient, limit = 12) {
  const { data, error } = await supabase.rpc("trending_hashtags", { limit_count: limit });
  if (error || !data) return [];
  return (data as { tag: string }[]).map((row) => row.tag);
}

export async function fetchPoemForMetadata(supabase: SupabaseClient, poemId: string) {
  const { data: poem, error } = await supabase
    .from("poems")
    .select("id, title, body, privacy, author_id")
    .eq("id", poemId)
    .maybeSingle();
  if (error || !poem || poem.privacy !== "public") return null;

  const { data: author } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("id", poem.author_id)
    .maybeSingle();

  return {
    id: poem.id,
    title: poem.title,
    body: poem.body,
    authorName: author?.display_name ?? "Autor",
    authorUsername: author?.username ?? "",
  };
}

async function fetchMessagingData(supabase: SupabaseClient, userId: string | null) {
  if (!userId) {
    return {
      conversations: [] as Conversation[],
      messages: [] as Message[],
      collaborativePoems: [] as CollaborativePoem[],
    };
  }

  const { data: myParts, error: partsErr } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);
  if (partsErr) throw partsErr;

  const convIds = [...new Set((myParts ?? []).map((p) => p.conversation_id))];
  let conversations: Conversation[] = [];
  let messages: Message[] = [];

  if (convIds.length > 0) {
    const [convsRes, allPartsRes, msgsRes] = await Promise.all([
      supabase.from("conversations").select("*").in("id", convIds).order("updated_at", { ascending: false }),
      supabase.from("conversation_participants").select("*").in("conversation_id", convIds),
      supabase.from("messages").select("*").in("conversation_id", convIds).order("created_at"),
    ]);
    if (convsRes.error) throw convsRes.error;
    if (allPartsRes.error) throw allPartsRes.error;
    if (msgsRes.error) throw msgsRes.error;

    const partsByConv = new Map<string, string[]>();
    for (const row of allPartsRes.data ?? []) {
      const list = partsByConv.get(row.conversation_id) ?? [];
      list.push(row.user_id);
      partsByConv.set(row.conversation_id, list);
    }

    conversations = (convsRes.data ?? []).map((c) =>
      mapConversation(c, partsByConv.get(c.id) ?? [])
    );
    messages = (msgsRes.data ?? []).map(mapMessage);
  }

  const { data: collabParts, error: collabPartsErr } = await supabase
    .from("collaborative_participants")
    .select("collab_id")
    .eq("user_id", userId);
  if (collabPartsErr) throw collabPartsErr;

  const collabIds = [...new Set((collabParts ?? []).map((p) => p.collab_id))];
  let collaborativePoems: CollaborativePoem[] = [];

  if (collabIds.length > 0) {
    const [collabsRes, collabRosterRes, versesRes] = await Promise.all([
      supabase.from("collaborative_poems").select("*").in("id", collabIds),
      supabase.from("collaborative_participants").select("*").in("collab_id", collabIds),
      supabase.from("collaborative_verses").select("*").in("collab_id", collabIds).order("position"),
    ]);
    if (collabsRes.error) throw collabsRes.error;
    if (collabRosterRes.error) throw collabRosterRes.error;
    if (versesRes.error) throw versesRes.error;

    const rosterByCollab = new Map<string, string[]>();
    for (const row of collabRosterRes.data ?? []) {
      const list = rosterByCollab.get(row.collab_id) ?? [];
      list.push(row.user_id);
      rosterByCollab.set(row.collab_id, list);
    }

    const versesByCollab = new Map<string, CollaborativePoem["verses"]>();
    for (const row of versesRes.data ?? []) {
      const list = versesByCollab.get(row.collab_id) ?? [];
      list.push({
        authorId: row.author_id,
        text: row.body,
        order: row.position,
      });
      versesByCollab.set(row.collab_id, list);
    }

    collaborativePoems = (collabsRes.data ?? []).map((c) =>
      mapCollaborativePoem(
        c,
        rosterByCollab.get(c.id) ?? [],
        versesByCollab.get(c.id) ?? []
      )
    );
  }

  return { conversations, messages, collaborativePoems };
}

export async function ensureConversationRemote(
  supabase: SupabaseClient,
  userId: string,
  otherUserId: string
) {
  const { data: myParts } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);

  const convIds = (myParts ?? []).map((p) => p.conversation_id);
  if (convIds.length > 0) {
    const { data: match } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .in("conversation_id", convIds)
      .eq("user_id", otherUserId)
      .limit(1)
      .maybeSingle();
    if (match) return match.conversation_id;
  }

  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .insert({ updated_at: new Date().toISOString() })
    .select("*")
    .single();
  if (convErr) throw convErr;

  const { error: partErr } = await supabase.from("conversation_participants").insert([
    { conversation_id: conv.id, user_id: userId },
    { conversation_id: conv.id, user_id: otherUserId },
  ]);
  if (partErr) throw partErr;

  return conv.id;
}

export async function sendMessageRemote(
  supabase: SupabaseClient,
  message: Message
) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      id: message.id,
      conversation_id: message.conversationId,
      sender_id: message.senderId,
      body: message.body,
      read: message.read,
      created_at: message.createdAt,
    })
    .select("*")
    .single();
  if (error) throw error;

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", message.conversationId);

  return mapMessage(data);
}

export async function markConversationReadRemote(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string
) {
  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .eq("read", false);
  if (error) throw error;
}

export async function insertCollabVerseRemote(
  supabase: SupabaseClient,
  collabId: string,
  authorId: string,
  body: string,
  position: number,
  verseId: string
) {
  const { error: verseErr } = await supabase.from("collaborative_verses").insert({
    id: verseId,
    collab_id: collabId,
    author_id: authorId,
    body,
    position,
  });
  if (verseErr) throw verseErr;

  await supabase
    .from("collaborative_poems")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", collabId);
}

export async function createCollaborativePoemRemote(
  supabase: SupabaseClient,
  collab: CollaborativePoem
) {
  const { error: collabErr } = await supabase.from("collaborative_poems").insert({
    id: collab.id,
    title: collab.title,
    status: collab.status,
    created_at: collab.createdAt,
    updated_at: collab.updatedAt,
  });
  if (collabErr) throw collabErr;

  const { error: partErr } = await supabase.from("collaborative_participants").insert(
    collab.participantIds.map((user_id) => ({ collab_id: collab.id, user_id }))
  );
  if (partErr) throw partErr;
}
