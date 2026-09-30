import type {
  Bookmark,
  BookmarkCollection,
  BookSection,
  CollaborativePoem,
  Comment,
  Conversation,
  Draft,
  DraftVersion,
  Follow,
  Message,
  Notification,
  Poem,
  Reaction,
  User,
} from "@/lib/types";
import { DEFAULT_POEM_STYLE, getThemeDefaultText } from "@/lib/poem-style";

export type DbProfile = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_color?: string;
  avatar_url?: string | null;
  style_tags?: string[] | null;
  pinned_poem_ids?: string[] | null;
  created_at: string;
};

export type DbPoem = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  font: Poem["font"];
  theme: Poem["theme"];
  text_color?: string | null;
  font_size?: Poem["fontSize"] | null;
  privacy: Poem["privacy"];
  hashtags: string[];
  applause_count: number;
  snap_count: number;
  comment_count: number;
  view_count: number;
  audio_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type DbDraft = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  font: Draft["font"];
  theme: Draft["theme"];
  text_color?: string | null;
  font_size?: Draft["fontSize"] | null;
  privacy: Draft["privacy"];
  hashtags: string[];
  updated_at: string;
};

export function mapProfile(row: DbProfile): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio ?? "",
    avatarColor: row.avatar_color ?? "#C4956A",
    avatarUrl: row.avatar_url ?? undefined,
    styleTags: row.style_tags ?? [],
    pinnedPoemIds: row.pinned_poem_ids ?? [],
    createdAt: row.created_at,
  };
}

export function mapPoem(row: DbPoem): Poem {
  return {
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    body: row.body,
    font: row.font,
    theme: row.theme,
    textColor: row.text_color ?? getThemeDefaultText(row.theme),
    fontSize: row.font_size ?? DEFAULT_POEM_STYLE.fontSize,
    privacy: row.privacy,
    hashtags: row.hashtags ?? [],
    applauseCount: row.applause_count,
    snapCount: row.snap_count,
    commentCount: row.comment_count,
    viewCount: row.view_count,
    audioUrl: row.audio_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDraft(row: DbDraft): Draft {
  return {
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    body: row.body,
    font: row.font,
    theme: row.theme,
    textColor: row.text_color ?? getThemeDefaultText(row.theme),
    fontSize: row.font_size ?? DEFAULT_POEM_STYLE.fontSize,
    privacy: row.privacy,
    hashtags: row.hashtags ?? [],
    updatedAt: row.updated_at,
  };
}

export function mapFollow(row: {
  follower_id: string;
  following_id: string;
  created_at: string;
}): Follow {
  return {
    followerId: row.follower_id,
    followingId: row.following_id,
    createdAt: row.created_at,
  };
}

export function mapReaction(row: {
  id: string;
  user_id: string;
  poem_id: string;
  type: Reaction["type"];
  created_at: string;
}): Reaction {
  return {
    id: row.id,
    userId: row.user_id,
    poemId: row.poem_id,
    type: row.type,
    createdAt: row.created_at,
  };
}

export function mapComment(row: {
  id: string;
  poem_id: string;
  author_id: string;
  body: string;
  created_at: string;
}): Comment {
  return {
    id: row.id,
    poemId: row.poem_id,
    authorId: row.author_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

export function mapCollection(row: {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}): BookmarkCollection {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at,
  };
}

export function mapBookmark(row: {
  id: string;
  collection_id: string;
  poem_id: string;
  created_at: string;
}): Bookmark {
  return {
    id: row.id,
    collectionId: row.collection_id,
    poemId: row.poem_id,
    createdAt: row.created_at,
  };
}

export function mapBookSection(row: {
  id: string;
  book_id: string;
  section_type: BookSection["type"];
  title?: string | null;
  body: string;
  placement: BookSection["placement"];
  position: number;
  created_at: string;
}): BookSection {
  return {
    id: row.id,
    bookId: row.book_id,
    type: row.section_type,
    title: row.title ?? undefined,
    body: row.body,
    placement: row.placement,
    position: row.position,
    createdAt: row.created_at,
  };
}

export function mapBook(
  row: {
    id: string;
    author_id: string;
    title: string;
    description: string;
    slug: string;
    cover_url?: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
  },
  poemIds: string[],
  sections: BookSection[] = []
) {
  return {
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    description: row.description,
    slug: row.slug,
    coverUrl: row.cover_url ?? undefined,
    poemIds,
    sections,
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapNotification(row: {
  id: string;
  user_id: string;
  actor_id: string;
  type: Notification["type"];
  poem_id?: string | null;
  comment_id?: string | null;
  read: boolean;
  created_at: string;
}): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    actorId: row.actor_id,
    type: row.type,
    poemId: row.poem_id ?? undefined,
    commentId: row.comment_id ?? undefined,
    read: row.read,
    createdAt: row.created_at,
  };
}

export function mapConversation(
  row: { id: string; updated_at: string },
  participantIds: string[]
): Conversation {
  return {
    id: row.id,
    participantIds,
    updatedAt: row.updated_at,
  };
}

export function mapMessage(row: {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read: boolean;
  created_at: string;
}): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    read: row.read,
    createdAt: row.created_at,
  };
}

export function mapCollaborativePoem(
  row: {
    id: string;
    title: string;
    status: CollaborativePoem["status"];
    created_at: string;
    updated_at: string;
  },
  participantIds: string[],
  verses: CollaborativePoem["verses"]
): CollaborativePoem {
  return {
    id: row.id,
    title: row.title,
    participantIds,
    verses,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDraftVersion(row: {
  id: string;
  draft_id: string;
  author_id: string;
  title: string;
  body: string;
  font: DraftVersion["font"];
  theme: DraftVersion["theme"];
  text_color?: string | null;
  font_size?: DraftVersion["fontSize"] | null;
  label?: string | null;
  created_at: string;
}): DraftVersion {
  return {
    id: row.id,
    draftId: row.draft_id,
    authorId: row.author_id,
    title: row.title,
    body: row.body,
    font: row.font,
    theme: row.theme,
    textColor: row.text_color ?? getThemeDefaultText(row.theme),
    fontSize: row.font_size ?? DEFAULT_POEM_STYLE.fontSize,
    label: row.label ?? undefined,
    createdAt: row.created_at,
  };
}
