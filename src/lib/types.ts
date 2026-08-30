export type Privacy = "public" | "private" | "followers";
export type FontStyle = "classic" | "typewriter" | "sans" | "elegant";
export type ThemeStyle =
  | "light"
  | "dark"
  | "parchment"
  | "midnight"
  | "rose"
  | "forest"
  | "ocean"
  | "cream"
  | "wine"
  | "slate";
export type FontSize = "sm" | "md" | "lg" | "xl";
export type ReactionType = "applause" | "snap";

export type NotificationType = "poem_published" | "comment" | "reaction" | "follow";

export interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarColor: string;
  avatarUrl?: string;
  styleTags: string[];
  pinnedPoemIds: string[];
  createdAt: string;
}

export interface Poem {
  id: string;
  authorId: string;
  title: string;
  body: string;
  font: FontStyle;
  theme: ThemeStyle;
  textColor: string;
  fontSize: FontSize;
  privacy: Privacy;
  hashtags: string[];
  applauseCount: number;
  snapCount: number;
  commentCount: number;
  viewCount: number;
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Draft {
  id: string;
  authorId: string;
  title: string;
  body: string;
  font: FontStyle;
  theme: ThemeStyle;
  textColor: string;
  fontSize: FontSize;
  privacy: Privacy;
  hashtags: string[];
  updatedAt: string;
}

export interface DraftVersion {
  id: string;
  draftId: string;
  authorId: string;
  title: string;
  body: string;
  font: FontStyle;
  theme: ThemeStyle;
  textColor: string;
  fontSize: FontSize;
  label?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  poemId?: string;
  commentId?: string;
  read: boolean;
  createdAt: string;
}

export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface NotificationMute {
  userId: string;
  mutedUserId?: string;
  mutedPoemId?: string;
  createdAt: string;
}

export interface Reaction {
  id: string;
  userId: string;
  poemId: string;
  type: ReactionType;
  createdAt: string;
}

export interface OfflineMutation {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface Comment {
  id: string;
  poemId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface BookmarkCollection {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  collectionId: string;
  poemId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface CollaborativePoem {
  id: string;
  title: string;
  participantIds: string[];
  verses: { authorId: string; text: string; order: number }[];
  status: "active" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  prompt: string;
  hashtag: string;
  startsAt: string;
  endsAt: string;
}

export interface Book {
  id: string;
  authorId: string;
  title: string;
  description: string;
  slug: string;
  coverUrl?: string;
  poemIds: string[];
  sections: BookSection[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BookSectionType =
  | "dedication"
  | "epigraph"
  | "preface"
  | "prologue"
  | "introduction"
  | "acknowledgments"
  | "afterword"
  | "appendix"
  | "note"
  | "custom";

export interface BookSection {
  id: string;
  bookId: string;
  type: BookSectionType;
  title?: string;
  body: string;
  placement: "front" | "back";
  position: number;
  createdAt: string;
}

export interface AppState {
  currentUserId: string | null;
  users: User[];
  poems: Poem[];
  drafts: Draft[];
  follows: Follow[];
  reactions: Reaction[];
  comments: Comment[];
  bookmarkCollections: BookmarkCollection[];
  bookmarks: Bookmark[];
  conversations: Conversation[];
  messages: Message[];
  collaborativePoems: CollaborativePoem[];
  challenges: Challenge[];
  books: Book[];
  notifications: Notification[];
  notificationMutes: NotificationMute[];
  draftVersions: DraftVersion[];
  offlineQueue: OfflineMutation[];
  isOnline: boolean;
  hydrated: boolean;
  cloudEnabled: boolean;
  lastCloudSyncAt: string | null;
}
