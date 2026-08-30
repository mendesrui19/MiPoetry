"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_USER_ID, SEED_STATE } from "./seed";
import type {
  AppState,
  Book,
  BookSection,
  BookSectionType,
  Comment,
  Draft,
  DraftVersion,
  FontSize,
  FontStyle,
  Message,
  Notification,
  NotificationMute,
  NotificationType,
  Poem,
  Privacy,
  ReactionType,
  ThemeStyle,
  User,
} from "./types";
import { DEFAULT_POEM_STYLE } from "./poem-style";
import { extractHashtags, generateId } from "./utils";
import { bodyToPlainText, isRichBody } from "./rich-text";
import { uniqueBookSlug } from "./slug";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/client";
import * as supabaseApi from "./supabase/api";
import type { SupabaseClient } from "@supabase/supabase-js";

interface StoreActions {
  setHydrated: () => void;
  login: (username: string) => boolean;
  logout: () => void;
  signup: (data: {
    username: string;
    displayName: string;
    bio?: string;
  }) => boolean;
  updateProfile: (
    data: Partial<
      Pick<User, "displayName" | "bio" | "avatarUrl" | "styleTags" | "pinnedPoemIds">
    >
  ) => void;
  follow: (userId: string) => void;
  unfollow: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  saveDraft: (draft: {
    id?: string;
    title: string;
    body: string;
    font: FontStyle;
    theme: ThemeStyle;
    textColor?: string;
    fontSize?: FontSize;
    privacy: Privacy;
  }) => string;
  deleteDraft: (id: string) => void;
  publishPoem: (draftId: string | null, data: {
    title: string;
    body: string;
    font: FontStyle;
    theme: ThemeStyle;
    textColor?: string;
    fontSize?: FontSize;
    privacy: Privacy;
  }) => string | null;
  deletePoem: (id: string) => void;
  updatePoem: (
    id: string,
    data: {
      title: string;
      body: string;
      font: FontStyle;
      theme: ThemeStyle;
      textColor?: string;
      fontSize?: FontSize;
      privacy: Privacy;
    }
  ) => boolean;
  toggleReaction: (poemId: string, type: ReactionType) => void;
  getUserReaction: (poemId: string) => ReactionType | null;
  addComment: (poemId: string, body: string) => void;
  deleteComment: (id: string) => void;
  addBookmark: (poemId: string, collectionId?: string) => void;
  removeBookmark: (poemId: string) => void;
  setBookmarkCollection: (poemId: string, collectionId: string) => void;
  getBookmarkCollectionId: (poemId: string) => string | null;
  isBookmarked: (poemId: string) => boolean;
  createCollection: (name: string) => string;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  sendMessage: (conversationId: string, body: string) => void;
  startConversation: (userId: string) => string;
  markConversationRead: (conversationId: string) => void;
  getUnreadCount: () => number;
  incrementViewCount: (poemId: string) => void;
  getFollowers: (userId: string) => User[];
  getFollowing: (userId: string) => User[];
  addCollabVerse: (collabId: string, text: string) => void;
  createBook: (title: string, description: string) => string;
  updateBook: (
    bookId: string,
    data: Partial<Pick<Book, "title" | "description" | "slug" | "coverUrl">>
  ) => void;
  toggleBookPublic: (bookId: string) => void;
  reorderBookPoems: (bookId: string, poemIds: string[]) => void;
  setBookCover: (bookId: string, coverUrl: string) => void;
  addPoemToBook: (bookId: string, poemId: string) => void;
  removePoemFromBook: (bookId: string, poemId: string) => void;
  addBookSection: (
    bookId: string,
    type: BookSectionType,
    placement: "front" | "back"
  ) => string;
  updateBookSection: (
    sectionId: string,
    data: Partial<Pick<BookSection, "type" | "title" | "body" | "placement">>
  ) => void;
  removeBookSection: (sectionId: string) => void;
  reorderBookSections: (
    bookId: string,
    placement: "front" | "back",
    sectionIds: string[]
  ) => void;
  pinPoem: (poemId: string) => void;
  unpinPoem: (poemId: string) => void;
  setPoemAudio: (poemId: string, audioUrl: string | null) => void;
  getUnreadNotificationCount: () => number;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  muteUserNotifications: (mutedUserId: string) => void;
  mutePoemNotifications: (mutedPoemId: string) => void;
  saveDraftVersion: (draftId: string, label?: string) => void;
  getDraftVersions: (draftId: string) => DraftVersion[];
  restoreDraftVersion: (draftId: string, versionId: string) => void;
  setOnlineStatus: (online: boolean) => void;
  flushOfflineQueue: () => void;
  getVisiblePoems: (viewerId: string | null) => Poem[];
  getFeedFollowing: () => Poem[];
  getFeedDiscover: () => Poem[];
  getDiscoverBooks: () => Book[];
  searchPoems: (query: string) => Poem[];
  searchBooks: (query: string) => Book[];
  searchUsers: (query: string) => User[];
  resetDemo: () => void;
  cloudEnabled: boolean;
  setCloudSession: (userId: string, enabled: boolean) => void;
  clearCloudSession: () => void;
  loadFromCloud: (data: Partial<Omit<AppState, "hydrated" | "cloudEnabled">>) => void;
  refreshFromCloud: () => Promise<void>;
  lastCloudSyncAt: string | null;
}

type Store = AppState & StoreActions;

const draftVersionMeta = new Map<
  string,
  { lastSavedAt: number; lastBody: string; lastTitle: string }
>();

const cloudInitialState: AppState = {
  currentUserId: null,
  hydrated: false,
  cloudEnabled: false,
  users: [],
  poems: [],
  drafts: [],
  follows: [],
  reactions: [],
  comments: [],
  bookmarkCollections: [],
  bookmarks: [],
  conversations: [],
  messages: [],
  collaborativePoems: [],
  challenges: [],
  books: [],
  notifications: [],
  notificationMutes: [],
  draftVersions: [],
  offlineQueue: [],
  isOnline: true,
  lastCloudSyncAt: null,
};

const initialState: AppState = isSupabaseConfigured()
  ? cloudInitialState
  : {
      ...SEED_STATE,
      currentUserId: DEMO_USER_ID,
      hydrated: false,
      cloudEnabled: false,
      lastCloudSyncAt: null,
    };

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      const syncCloud = (
        fn: (supabase: SupabaseClient, userId: string) => Promise<void>
      ) => {
        const { cloudEnabled, currentUserId, isOnline } = get();
        if (!cloudEnabled || !currentUserId) return;
        if (!isOnline) return;
        const supabase = createClient();
        void fn(supabase, currentUserId).catch((err: unknown) => {
          const message =
            err && typeof err === "object" && "message" in err
              ? String((err as { message: string }).message)
              : String(err);
          console.error("Supabase sync error:", message);
        });
      };

      const pushNotification = (
        recipientId: string,
        actorId: string,
        type: NotificationType,
        opts?: { poemId?: string; commentId?: string }
      ) => {
        if (recipientId === actorId) return;
        const { notificationMutes } = get();
        const muted = notificationMutes.some(
          (m) =>
            m.userId === recipientId &&
            (m.mutedUserId === actorId ||
              (opts?.poemId != null && m.mutedPoemId === opts.poemId))
        );
        if (muted) return;
        const notification: Notification = {
          id: generateId(),
          userId: recipientId,
          actorId,
          type,
          poemId: opts?.poemId,
          commentId: opts?.commentId,
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          notifications: [notification, ...s.notifications],
        }));
        syncCloud(async (supabase) => {
          await supabaseApi.insertNotificationRemote(supabase, {
            id: notification.id,
            userId: notification.userId,
            actorId: notification.actorId,
            type: notification.type,
            poemId: notification.poemId,
            commentId: notification.commentId,
          });
        });
      };

      const syncBookRemote = (bookId: string) => {
        const book = get().books.find((b) => b.id === bookId);
        const uid = get().currentUserId;
        if (!book || !uid || book.authorId !== uid) return;
        syncCloud(async (supabase, authorId) => {
          await supabaseApi.upsertBookRemote(supabase, authorId, {
            id: book.id,
            title: book.title,
            description: book.description,
            slug: book.slug,
            coverUrl: book.coverUrl,
            isPublic: book.isPublic,
            poemIds: book.poemIds,
          });
        });
      };

      return {
      ...initialState,

      setHydrated: () => set({ hydrated: true }),

      setCloudSession: (userId, enabled) =>
        set({ currentUserId: userId, cloudEnabled: enabled }),

      clearCloudSession: () =>
        set({
          currentUserId: null,
          cloudEnabled: false,
          drafts: [],
          bookmarkCollections: [],
          bookmarks: [],
          conversations: [],
          messages: [],
          collaborativePoems: [],
          books: [],
          challenges: [],
          notifications: [],
          notificationMutes: [],
          draftVersions: [],
          offlineQueue: [],
          lastCloudSyncAt: null,
        }),

      loadFromCloud: (data) =>
        set((s) => ({
          users: data.users ?? s.users,
          poems: data.poems ?? s.poems,
          drafts: data.drafts ?? s.drafts,
          follows: data.follows ?? s.follows,
          reactions: data.reactions ?? s.reactions,
          comments: data.comments ?? s.comments,
          bookmarkCollections: data.bookmarkCollections ?? s.bookmarkCollections,
          bookmarks: data.bookmarks ?? s.bookmarks,
          books: (data.books ?? s.books).map((b) => ({
            ...b,
            sections: b.sections ?? [],
          })),
          notifications: data.notifications ?? s.notifications,
          draftVersions: data.draftVersions ?? s.draftVersions,
          conversations: [],
          messages: [],
          collaborativePoems: [],
          challenges: [],
          lastCloudSyncAt: new Date().toISOString(),
        })),

      refreshFromCloud: async () => {
        if (!isSupabaseConfigured()) return;
        const supabase = createClient();
        const uid = get().currentUserId;
        const data = uid
          ? await supabaseApi.fetchAllData(supabase, uid)
          : await supabaseApi.fetchPublicData(supabase);
        get().loadFromCloud(data);
      },

      login: (username) => {
        const user = get().users.find(
          (u) => u.username.toLowerCase() === username.toLowerCase()
        );
        if (!user) return false;
        set({ currentUserId: user.id });
        return true;
      },

      logout: () => {
        if (isSupabaseConfigured()) {
          void import("@/components/providers/supabase-provider").then((m) =>
            m.signOutCloud()
          );
          return;
        }
        set({ currentUserId: null });
      },

      signup: ({ username, displayName, bio = "" }) => {
        const exists = get().users.some(
          (u) => u.username.toLowerCase() === username.toLowerCase()
        );
        if (exists) return false;
        const user: User = {
          id: generateId(),
          username,
          displayName,
          bio,
          avatarColor: "#C4956A",
          styleTags: [],
          pinnedPoemIds: [],
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          users: [...s.users, user],
          currentUserId: user.id,
          bookmarkCollections: [
            ...s.bookmarkCollections,
            {
              id: generateId(),
              userId: user.id,
              name: "Favoritos",
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        return true;
      },

      updateProfile: (data) => {
        const uid = get().currentUserId;
        if (!uid) return;
        set((s) => ({
          users: s.users.map((u) => (u.id === uid ? { ...u, ...data } : u)),
        }));
        syncCloud(async (supabase) => {
          await supabaseApi.updateProfileRemote(supabase, uid, data);
        });
      },

      follow: (userId) => {
        const uid = get().currentUserId;
        if (!uid || uid === userId) return;
        if (get().follows.some((f) => f.followerId === uid && f.followingId === userId))
          return;
        set((s) => ({
          follows: [
            ...s.follows,
            { followerId: uid, followingId: userId, createdAt: new Date().toISOString() },
          ],
        }));
        pushNotification(userId, uid, "follow");
        syncCloud((supabase) =>
          supabaseApi.toggleFollowRemote(supabase, uid, userId, true)
        );
      },

      unfollow: (userId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        set((s) => ({
          follows: s.follows.filter(
            (f) => !(f.followerId === uid && f.followingId === userId)
          ),
        }));
        syncCloud((supabase) =>
          supabaseApi.toggleFollowRemote(supabase, uid, userId, false)
        );
      },

      isFollowing: (userId) => {
        const uid = get().currentUserId;
        if (!uid) return false;
        return get().follows.some(
          (f) => f.followerId === uid && f.followingId === userId
        );
      },

      saveDraft: (draft) => {
        const uid = get().currentUserId;
        if (!uid) return "";
        const id = draft.id ?? generateId();
        const now = new Date().toISOString();
        const hashtags = extractHashtags(`${draft.title} ${bodyToPlainText(draft.body)}`);
        set((s) => {
          const existing = s.drafts.find((d) => d.id === id);
          const item: Draft = {
            id,
            authorId: uid,
            title: draft.title,
            body: draft.body,
            font: draft.font,
            theme: draft.theme,
            textColor: draft.textColor ?? DEFAULT_POEM_STYLE.textColor,
            fontSize: draft.fontSize ?? DEFAULT_POEM_STYLE.fontSize,
            privacy: draft.privacy,
            hashtags,
            updatedAt: now,
          };

          const meta = draftVersionMeta.get(id) ?? {
            lastSavedAt: 0,
            lastBody: "",
            lastTitle: "",
          };
          const bodyChanged =
            draft.title !== meta.lastTitle ||
            Math.abs(bodyToPlainText(draft.body).length - bodyToPlainText(meta.lastBody).length) >
              50;
          const timeElapsed = Date.now() - meta.lastSavedAt > 5 * 60 * 1000;
          if (!existing || bodyChanged || timeElapsed) {
            draftVersionMeta.set(id, {
              lastSavedAt: Date.now(),
              lastBody: draft.body,
              lastTitle: draft.title,
            });
            queueMicrotask(() => get().saveDraftVersion(id));
          }

          return {
            drafts: existing
              ? s.drafts.map((d) => (d.id === id ? item : d))
              : [...s.drafts, item],
          };
        });
        syncCloud(async (supabase) => {
          await supabaseApi.upsertDraft(supabase, uid, {
            id,
            title: draft.title,
            body: draft.body,
            font: draft.font,
            theme: draft.theme,
            textColor: draft.textColor ?? DEFAULT_POEM_STYLE.textColor,
            fontSize: draft.fontSize ?? DEFAULT_POEM_STYLE.fontSize,
            privacy: draft.privacy,
            hashtags,
          });
        });
        return id;
      },

      deleteDraft: (id) => {
        set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) }));
        syncCloud((supabase) => supabaseApi.deleteDraftRemote(supabase, id));
      },

      publishPoem: (draftId, data) => {
        const uid = get().currentUserId;
        if (!uid) return null;
        const now = new Date().toISOString();
        const hashtags = extractHashtags(`${data.title} ${bodyToPlainText(data.body)}`);
        const poem: Poem = {
          id: generateId(),
          authorId: uid,
          title: data.title.trim() || "Sem título",
          body: isRichBody(data.body) ? data.body : data.body.trim(),
          font: data.font,
          theme: data.theme,
          textColor: data.textColor ?? DEFAULT_POEM_STYLE.textColor,
          fontSize: data.fontSize ?? DEFAULT_POEM_STYLE.fontSize,
          privacy: data.privacy,
          hashtags,
          applauseCount: 0,
          snapCount: 0,
          commentCount: 0,
          viewCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          poems: [poem, ...s.poems],
          drafts: draftId ? s.drafts.filter((d) => d.id !== draftId) : s.drafts,
        }));
        const followers = get()
          .follows.filter((f) => f.followingId === uid)
          .map((f) => f.followerId);
        for (const followerId of followers) {
          pushNotification(followerId, uid, "poem_published", { poemId: poem.id });
        }
        syncCloud(async (supabase, authorId) => {
          await supabaseApi.upsertPoem(supabase, authorId, {
            id: poem.id,
            title: poem.title,
            body: poem.body,
            font: poem.font,
            theme: poem.theme,
            textColor: poem.textColor,
            fontSize: poem.fontSize,
            privacy: poem.privacy,
            hashtags: poem.hashtags,
          });
          if (draftId) await supabaseApi.deleteDraftByIdAfterPublish(supabase, draftId);
        });
        return poem.id;
      },

      deletePoem: (id) => {
        set((s) => ({
          poems: s.poems.filter((p) => p.id !== id),
          bookmarks: s.bookmarks.filter((b) => b.poemId !== id),
          comments: s.comments.filter((c) => c.poemId !== id),
          reactions: s.reactions.filter((r) => r.poemId !== id),
          books: s.books.map((b) => ({
            ...b,
            poemIds: b.poemIds.filter((pid) => pid !== id),
          })),
        }));
        syncCloud((supabase) => supabaseApi.deletePoemRemote(supabase, id));
      },

      updatePoem: (id, data) => {
        const uid = get().currentUserId;
        if (!uid) return false;
        const poem = get().poems.find((p) => p.id === id);
        if (!poem || poem.authorId !== uid) return false;
        const now = new Date().toISOString();
        const hashtags = extractHashtags(`${data.title} ${bodyToPlainText(data.body)}`);
        set((s) => ({
          poems: s.poems.map((p) =>
            p.id === id
              ? {
                  ...p,
                  title: data.title.trim() || "Sem título",
                  body: isRichBody(data.body) ? data.body : data.body.trim(),
                  font: data.font,
                  theme: data.theme,
                  textColor: data.textColor ?? DEFAULT_POEM_STYLE.textColor,
                  fontSize: data.fontSize ?? DEFAULT_POEM_STYLE.fontSize,
                  privacy: data.privacy,
                  hashtags,
                  updatedAt: now,
                }
              : p
          ),
        }));
        syncCloud(async (supabase, authorId) => {
          await supabaseApi.upsertPoem(supabase, authorId, {
            id,
            title: data.title.trim() || "Sem título",
            body: isRichBody(data.body) ? data.body : data.body.trim(),
            font: data.font,
            theme: data.theme,
            textColor: data.textColor ?? DEFAULT_POEM_STYLE.textColor,
            fontSize: data.fontSize ?? DEFAULT_POEM_STYLE.fontSize,
            privacy: data.privacy,
            hashtags,
          });
        });
        return true;
      },

      toggleReaction: (poemId, type) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const existing = get().reactions.find(
          (r) => r.userId === uid && r.poemId === poemId
        );
        const removing = existing?.type === type;
        set((s) => {
          let reactions = [...s.reactions];
          let poems = [...s.poems];
          const poemIdx = poems.findIndex((p) => p.id === poemId);
          if (poemIdx === -1) return s;

          const poem = { ...poems[poemIdx] };

          if (existing) {
            if (existing.type === type) {
              reactions = reactions.filter((r) => r.id !== existing.id);
              if (type === "applause") poem.applauseCount = Math.max(0, poem.applauseCount - 1);
              else poem.snapCount = Math.max(0, poem.snapCount - 1);
            } else {
              reactions = reactions.map((r) =>
                r.id === existing.id ? { ...r, type } : r
              );
              if (existing.type === "applause") poem.applauseCount = Math.max(0, poem.applauseCount - 1);
              else poem.snapCount = Math.max(0, poem.snapCount - 1);
              if (type === "applause") poem.applauseCount += 1;
              else poem.snapCount += 1;
            }
          } else {
            reactions.push({
              id: generateId(),
              userId: uid,
              poemId,
              type,
              createdAt: new Date().toISOString(),
            });
            if (type === "applause") poem.applauseCount += 1;
            else poem.snapCount += 1;
          }

          poems[poemIdx] = poem;
          return { reactions, poems };
        });
        if (!removing) {
          const poem = get().poems.find((p) => p.id === poemId);
          if (poem) pushNotification(poem.authorId, uid, "reaction", { poemId });
        }
        syncCloud((supabase) =>
          supabaseApi.toggleReactionRemote(supabase, uid, poemId, type, removing)
        );
      },

      getUserReaction: (poemId) => {
        const uid = get().currentUserId;
        if (!uid) return null;
        return get().reactions.find((r) => r.userId === uid && r.poemId === poemId)?.type ?? null;
      },

      addComment: (poemId, body) => {
        const uid = get().currentUserId;
        if (!uid || !body.trim()) return;
        const comment: Comment = {
          id: generateId(),
          poemId,
          authorId: uid,
          body: body.trim(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          comments: [...s.comments, comment],
          poems: s.poems.map((p) =>
            p.id === poemId ? { ...p, commentCount: p.commentCount + 1 } : p
          ),
        }));
        const poem = get().poems.find((p) => p.id === poemId);
        if (poem) {
          pushNotification(poem.authorId, uid, "comment", {
            poemId,
            commentId: comment.id,
          });
        }
        syncCloud(async (supabase, authorId) => {
          await supabaseApi.addCommentRemote(supabase, authorId, poemId, body, comment.id);
        });
      },

      deleteComment: (id) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const comment = get().comments.find((c) => c.id === id);
        if (!comment || comment.authorId !== uid) return;
        set((s) => ({
          comments: s.comments.filter((c) => c.id !== id),
          poems: s.poems.map((p) =>
            p.id === comment.poemId
              ? { ...p, commentCount: Math.max(0, p.commentCount - 1) }
              : p
          ),
        }));
        syncCloud((supabase) => supabaseApi.deleteCommentRemote(supabase, id));
      },

      addBookmark: (poemId, collectionId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const colId =
          collectionId ??
          get().bookmarkCollections.find((c) => c.userId === uid)?.id;
        if (!colId) return;
        if (get().bookmarks.some((b) => b.collectionId === colId && b.poemId === poemId))
          return;
        set((s) => ({
          bookmarks: [
            ...s.bookmarks,
            {
              id: generateId(),
              collectionId: colId,
              poemId,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        syncCloud((supabase) =>
          supabaseApi.setBookmarkRemote(supabase, colId, poemId, false)
        );
      },

      removeBookmark: (poemId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const colIds = get()
          .bookmarkCollections.filter((c) => c.userId === uid)
          .map((c) => c.id);
        const existing = get().bookmarks.find(
          (b) => colIds.includes(b.collectionId) && b.poemId === poemId
        );
        set((s) => ({
          bookmarks: s.bookmarks.filter(
            (b) => !(colIds.includes(b.collectionId) && b.poemId === poemId)
          ),
        }));
        if (existing) {
          syncCloud((supabase) =>
            supabaseApi.setBookmarkRemote(
              supabase,
              existing.collectionId,
              poemId,
              true
            )
          );
        }
      },

      setBookmarkCollection: (poemId, collectionId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const colIds = get()
          .bookmarkCollections.filter((c) => c.userId === uid)
          .map((c) => c.id);
        if (!colIds.includes(collectionId)) return;
        set((s) => ({
          bookmarks: [
            ...s.bookmarks.filter(
              (b) => !(colIds.includes(b.collectionId) && b.poemId === poemId)
            ),
            {
              id: generateId(),
              collectionId,
              poemId,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        syncCloud((supabase) =>
          supabaseApi.setBookmarkRemote(supabase, collectionId, poemId, false)
        );
      },

      getBookmarkCollectionId: (poemId) => {
        const uid = get().currentUserId;
        if (!uid) return null;
        const colIds = get()
          .bookmarkCollections.filter((c) => c.userId === uid)
          .map((c) => c.id);
        return (
          get().bookmarks.find(
            (b) => colIds.includes(b.collectionId) && b.poemId === poemId
          )?.collectionId ?? null
        );
      },

      isBookmarked: (poemId) => {
        const uid = get().currentUserId;
        if (!uid) return false;
        const colIds = get()
          .bookmarkCollections.filter((c) => c.userId === uid)
          .map((c) => c.id);
        return get().bookmarks.some(
          (b) => colIds.includes(b.collectionId) && b.poemId === poemId
        );
      },

      createCollection: (name) => {
        const uid = get().currentUserId;
        if (!uid) return "";
        const id = generateId();
        set((s) => ({
          bookmarkCollections: [
            ...s.bookmarkCollections,
            { id, userId: uid, name, createdAt: new Date().toISOString() },
          ],
        }));
        return id;
      },

      renameCollection: (id, name) => {
        const uid = get().currentUserId;
        if (!uid || !name.trim()) return;
        set((s) => ({
          bookmarkCollections: s.bookmarkCollections.map((c) =>
            c.id === id && c.userId === uid ? { ...c, name: name.trim() } : c
          ),
        }));
      },

      deleteCollection: (id) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const col = get().bookmarkCollections.find((c) => c.id === id);
        if (!col || col.userId !== uid) return;
        set((s) => ({
          bookmarkCollections: s.bookmarkCollections.filter((c) => c.id !== id),
          bookmarks: s.bookmarks.filter((b) => b.collectionId !== id),
        }));
      },

      sendMessage: (conversationId, body) => {
        const uid = get().currentUserId;
        if (!uid || !body.trim()) return;
        const msg: Message = {
          id: generateId(),
          conversationId,
          senderId: uid,
          body: body.trim(),
          createdAt: new Date().toISOString(),
          read: false,
        };
        set((s) => ({
          messages: [...s.messages, msg],
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      },

      startConversation: (userId) => {
        const uid = get().currentUserId;
        if (!uid) return "";
        const existing = get().conversations.find(
          (c) =>
            c.participantIds.includes(uid) && c.participantIds.includes(userId)
        );
        if (existing) return existing.id;
        const id = generateId();
        set((s) => ({
          conversations: [
            ...s.conversations,
            {
              id,
              participantIds: [uid, userId],
              updatedAt: new Date().toISOString(),
            },
          ],
        }));
        return id;
      },

      markConversationRead: (conversationId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        set((s) => ({
          messages: s.messages.map((m) =>
            m.conversationId === conversationId && m.senderId !== uid
              ? { ...m, read: true }
              : m
          ),
        }));
      },

      getUnreadCount: () => {
        const uid = get().currentUserId;
        if (!uid) return 0;
        return get().messages.filter((m) => m.senderId !== uid && !m.read).length;
      },

      incrementViewCount: (poemId) => {
        set((s) => ({
          poems: s.poems.map((p) =>
            p.id === poemId ? { ...p, viewCount: p.viewCount + 1 } : p
          ),
        }));
        syncCloud((supabase) => supabaseApi.incrementViewRemote(supabase, poemId));
      },

      getFollowers: (userId) => {
        const followerIds = get()
          .follows.filter((f) => f.followingId === userId)
          .map((f) => f.followerId);
        return get().users.filter((u) => followerIds.includes(u.id));
      },

      getFollowing: (userId) => {
        const followingIds = get()
          .follows.filter((f) => f.followerId === userId)
          .map((f) => f.followingId);
        return get().users.filter((u) => followingIds.includes(u.id));
      },

      addCollabVerse: (collabId, text) => {
        const uid = get().currentUserId;
        if (!uid || !text.trim()) return;
        set((s) => ({
          collaborativePoems: s.collaborativePoems.map((c) => {
            if (c.id !== collabId) return c;
            const order = c.verses.length;
            return {
              ...c,
              verses: [...c.verses, { authorId: uid, text: text.trim(), order }],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      createBook: (title, description) => {
        const uid = get().currentUserId;
        if (!uid) return "";
        const id = generateId();
        const now = new Date().toISOString();
        const slug = uniqueBookSlug(
          title,
          get().books.map((b) => b.slug)
        );
        const book: Book = {
          id,
          authorId: uid,
          title,
          description,
          slug,
          poemIds: [],
          sections: [],
          isPublic: false,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ books: [...s.books, book] }));
        syncCloud(async (supabase, authorId) => {
          await supabaseApi.upsertBookRemote(supabase, authorId, {
            id: book.id,
            title: book.title,
            description: book.description,
            slug: book.slug,
            isPublic: book.isPublic,
            poemIds: [],
          });
        });
        return id;
      },

      updateBook: (bookId, data) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const book = get().books.find((b) => b.id === bookId);
        if (!book || book.authorId !== uid) return;
        const nextSlug =
          data.slug ??
          (data.title && data.title !== book.title
            ? uniqueBookSlug(
                data.title,
                get()
                  .books.filter((b) => b.id !== bookId)
                  .map((b) => b.slug)
              )
            : book.slug);
        set((s) => ({
          books: s.books.map((b) =>
            b.id === bookId
              ? {
                  ...b,
                  ...data,
                  slug: nextSlug,
                  updatedAt: new Date().toISOString(),
                }
              : b
          ),
        }));
        syncBookRemote(bookId);
      },

      toggleBookPublic: (bookId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const book = get().books.find((b) => b.id === bookId);
        if (!book || book.authorId !== uid) return;
        set((s) => ({
          books: s.books.map((b) =>
            b.id === bookId
              ? { ...b, isPublic: !b.isPublic, updatedAt: new Date().toISOString() }
              : b
          ),
        }));
        syncBookRemote(bookId);
      },

      reorderBookPoems: (bookId, poemIds) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const book = get().books.find((b) => b.id === bookId);
        if (!book || book.authorId !== uid) return;
        set((s) => ({
          books: s.books.map((b) =>
            b.id === bookId
              ? { ...b, poemIds, updatedAt: new Date().toISOString() }
              : b
          ),
        }));
        syncCloud(async (supabase) => {
          await supabaseApi.updateBookPoemsOrder(supabase, bookId, poemIds);
        });
      },

      setBookCover: (bookId, coverUrl) => {
        get().updateBook(bookId, { coverUrl });
      },

      addPoemToBook: (bookId, poemId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const book = get().books.find((b) => b.id === bookId);
        if (!book || book.authorId !== uid || book.poemIds.includes(poemId)) return;
        set((s) => ({
          books: s.books.map((b) =>
            b.id === bookId
              ? {
                  ...b,
                  poemIds: [...b.poemIds, poemId],
                  updatedAt: new Date().toISOString(),
                }
              : b
          ),
        }));
        syncBookRemote(bookId);
      },

      removePoemFromBook: (bookId, poemId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const book = get().books.find((b) => b.id === bookId);
        if (!book || book.authorId !== uid) return;
        set((s) => ({
          books: s.books.map((b) =>
            b.id === bookId
              ? {
                  ...b,
                  poemIds: b.poemIds.filter((id) => id !== poemId),
                  updatedAt: new Date().toISOString(),
                }
              : b
          ),
        }));
        syncBookRemote(bookId);
      },

      addBookSection: (bookId, type, placement) => {
        const uid = get().currentUserId;
        if (!uid) return "";
        const book = get().books.find((b) => b.id === bookId);
        if (!book || book.authorId !== uid) return "";
        const id = generateId();
        const position = book.sections.filter((s) => s.placement === placement).length;
        const section: BookSection = {
          id,
          bookId,
          type,
          body: "",
          placement,
          position,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          books: s.books.map((b) =>
            b.id === bookId ? { ...b, sections: [...b.sections, section] } : b
          ),
        }));
        syncCloud(async (supabase) => {
          await supabaseApi.upsertBookSectionRemote(supabase, {
            id: section.id,
            bookId,
            type,
            body: "",
            placement,
            position,
          });
        });
        return id;
      },

      updateBookSection: (sectionId, data) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const book = get().books.find(
          (b) => b.authorId === uid && b.sections.some((s) => s.id === sectionId)
        );
        const section = book?.sections.find((s) => s.id === sectionId);
        if (!book || !section) return;

        const next = { ...section, ...data };
        set((s) => ({
          books: s.books.map((b) =>
            b.id === book.id
              ? {
                  ...b,
                  sections: b.sections.map((sec) =>
                    sec.id === sectionId ? next : sec
                  ),
                }
              : b
          ),
        }));

        syncCloud(async (supabase) => {
          await supabaseApi.upsertBookSectionRemote(supabase, {
            id: next.id,
            bookId: next.bookId,
            type: next.type,
            title: next.title,
            body: next.body,
            placement: next.placement,
            position: next.position,
          });
        });
      },

      removeBookSection: (sectionId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const book = get().books.find(
          (b) => b.authorId === uid && b.sections.some((s) => s.id === sectionId)
        );
        if (!book) return;

        set((s) => ({
          books: s.books.map((b) =>
            b.id === book.id
              ? { ...b, sections: b.sections.filter((sec) => sec.id !== sectionId) }
              : b
          ),
        }));

        syncCloud(async (supabase) => {
          await supabaseApi.deleteBookSectionRemote(supabase, sectionId);
        });
      },

      reorderBookSections: (bookId, placement, sectionIds) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const book = get().books.find((b) => b.id === bookId);
        if (!book || book.authorId !== uid) return;

        set((s) => ({
          books: s.books.map((b) => {
            if (b.id !== bookId) return b;
            const others = b.sections.filter((sec) => sec.placement !== placement);
            const reordered = sectionIds
              .map((id, position) => {
                const sec = b.sections.find((s) => s.id === id);
                return sec ? { ...sec, position } : null;
              })
              .filter(Boolean) as BookSection[];
            return { ...b, sections: [...others, ...reordered] };
          }),
        }));

        syncCloud(async (supabase) => {
          await supabaseApi.reorderBookSectionsRemote(
            supabase,
            bookId,
            placement,
            sectionIds
          );
        });
      },

      pinPoem: (poemId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const user = get().users.find((u) => u.id === uid);
        if (!user || user.pinnedPoemIds.includes(poemId)) return;
        get().updateProfile({ pinnedPoemIds: [...user.pinnedPoemIds, poemId] });
      },

      unpinPoem: (poemId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const user = get().users.find((u) => u.id === uid);
        if (!user) return;
        get().updateProfile({
          pinnedPoemIds: user.pinnedPoemIds.filter((id) => id !== poemId),
        });
      },

      setPoemAudio: (poemId, audioUrl) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const poem = get().poems.find((p) => p.id === poemId);
        if (!poem || poem.authorId !== uid) return;
        set((s) => ({
          poems: s.poems.map((p) =>
            p.id === poemId ? { ...p, audioUrl: audioUrl ?? undefined } : p
          ),
        }));
        syncCloud(async (supabase, authorId) => {
          await supabaseApi.updatePoemAudioUrl(supabase, poemId, authorId, audioUrl);
        });
      },

      getUnreadNotificationCount: () => {
        const uid = get().currentUserId;
        if (!uid) return 0;
        return get().notifications.filter((n) => n.userId === uid && !n.read).length;
      },

      markNotificationRead: (notificationId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === notificationId && n.userId === uid ? { ...n, read: true } : n
          ),
        }));
        syncCloud((supabase) =>
          supabaseApi.markNotificationRead(supabase, notificationId, uid)
        );
      },

      markAllNotificationsRead: () => {
        const uid = get().currentUserId;
        if (!uid) return;
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.userId === uid ? { ...n, read: true } : n
          ),
        }));
        syncCloud((supabase) => supabaseApi.markAllNotificationsRead(supabase, uid));
      },

      muteUserNotifications: (mutedUserId) => {
        const uid = get().currentUserId;
        if (!uid || uid === mutedUserId) return;
        if (
          get().notificationMutes.some(
            (m) => m.userId === uid && m.mutedUserId === mutedUserId
          )
        ) {
          return;
        }
        const mute: NotificationMute = {
          userId: uid,
          mutedUserId,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ notificationMutes: [...s.notificationMutes, mute] }));
      },

      mutePoemNotifications: (mutedPoemId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        if (
          get().notificationMutes.some(
            (m) => m.userId === uid && m.mutedPoemId === mutedPoemId
          )
        ) {
          return;
        }
        const mute: NotificationMute = {
          userId: uid,
          mutedPoemId,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ notificationMutes: [...s.notificationMutes, mute] }));
      },

      saveDraftVersion: (draftId, label) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const draft = get().drafts.find((d) => d.id === draftId && d.authorId === uid);
        if (!draft) return;
        const version: DraftVersion = {
          id: generateId(),
          draftId,
          authorId: uid,
          title: draft.title,
          body: draft.body,
          font: draft.font,
          theme: draft.theme,
          textColor: draft.textColor,
          fontSize: draft.fontSize,
          label,
          createdAt: new Date().toISOString(),
        };
        set((s) => {
          const forDraft = [
            version,
            ...s.draftVersions.filter((v) => v.draftId === draftId),
          ].slice(0, 20);
          const rest = s.draftVersions.filter((v) => v.draftId !== draftId);
          return { draftVersions: [...forDraft, ...rest] };
        });
        syncCloud(async (supabase, authorId) => {
          await supabaseApi.insertDraftVersion(supabase, authorId, {
            id: version.id,
            draftId,
            title: draft.title,
            body: draft.body,
            font: draft.font,
            theme: draft.theme,
            textColor: draft.textColor,
            fontSize: draft.fontSize,
            label,
          });
        });
      },

      getDraftVersions: (draftId) => {
        const uid = get().currentUserId;
        if (!uid) return [];
        return get()
          .draftVersions.filter((v) => v.draftId === draftId && v.authorId === uid)
          .sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      },

      restoreDraftVersion: (draftId, versionId) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const version = get().draftVersions.find(
          (v) => v.id === versionId && v.draftId === draftId && v.authorId === uid
        );
        if (!version) return;
        const draft = get().drafts.find((d) => d.id === draftId);
        get().saveDraft({
          id: draftId,
          title: version.title,
          body: version.body,
          font: version.font,
          theme: version.theme,
          textColor: version.textColor,
          fontSize: version.fontSize,
          privacy: draft?.privacy ?? "public",
        });
      },

      setOnlineStatus: (online) => set({ isOnline: online }),

      flushOfflineQueue: () => {
        const { offlineQueue, isOnline, cloudEnabled, currentUserId } = get();
        if (!isOnline || !cloudEnabled || !currentUserId || offlineQueue.length === 0) {
          return;
        }
        const supabase = createClient();
        const uid = currentUserId;
        const queue = [...offlineQueue];
        set({ offlineQueue: [] });

        void (async () => {
          for (const mutation of queue) {
            try {
              switch (mutation.type) {
                case "updateProfile":
                  await supabaseApi.updateProfileRemote(
                    supabase,
                    uid,
                    mutation.payload as Parameters<typeof supabaseApi.updateProfileRemote>[2]
                  );
                  break;
                case "upsertBook": {
                  const payload = mutation.payload as Parameters<
                    typeof supabaseApi.upsertBookRemote
                  >[2];
                  await supabaseApi.upsertBookRemote(supabase, uid, payload);
                  break;
                }
                case "updatePoemAudio":
                  await supabaseApi.updatePoemAudioUrl(
                    supabase,
                    mutation.payload.poemId as string,
                    uid,
                    mutation.payload.audioUrl as string | null
                  );
                  break;
                default:
                  break;
              }
            } catch (err) {
              console.error("Offline queue replay error:", err);
              set((s) => ({
                offlineQueue: [...s.offlineQueue, mutation],
              }));
            }
          }
        })();
      },

      getVisiblePoems: (viewerId) => {
        const { poems, follows } = get();
        return poems.filter((p) => {
          if (p.privacy === "public") return true;
          if (!viewerId) return false;
          if (p.authorId === viewerId) return true;
          if (p.privacy === "private") return false;
          return follows.some(
            (f) => f.followerId === viewerId && f.followingId === p.authorId
          );
        });
      },

      getFeedFollowing: () => {
        const uid = get().currentUserId;
        if (!uid) return [];
        const followingIds = get()
          .follows.filter((f) => f.followerId === uid)
          .map((f) => f.followingId);
        return get()
          .getVisiblePoems(uid)
          .filter(
            (p) =>
              p.authorId !== uid && followingIds.includes(p.authorId)
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      },

      getFeedDiscover: () => {
        const uid = get().currentUserId;
        return get()
          .getVisiblePoems(uid)
          .filter((p) => p.privacy === "public" && p.authorId !== uid)
          .sort((a, b) => {
            const scoreA = a.applauseCount * 2 + a.snapCount * 3 + a.viewCount * 0.1;
            const scoreB = b.applauseCount * 2 + b.snapCount * 3 + b.viewCount * 0.1;
            return scoreB - scoreA;
          });
      },

      getDiscoverBooks: () => {
        const uid = get().currentUserId;
        return get()
          .books.filter((b) => b.isPublic && b.authorId !== uid)
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      },

      searchPoems: (query) => {
        const uid = get().currentUserId;
        const q = query.toLowerCase().replace(/^#/, "");
        if (!q) return [];
        return get()
          .getVisiblePoems(uid)
          .filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              bodyToPlainText(p.body).toLowerCase().includes(q) ||
              p.hashtags.some((h) => h.includes(q))
          );
      },

      searchBooks: (query) => {
        const q = query.toLowerCase();
        if (!q) return [];
        const uid = get().currentUserId;
        return get().books.filter(
          (b) =>
            b.isPublic &&
            b.authorId !== uid &&
            (b.title.toLowerCase().includes(q) ||
              b.description.toLowerCase().includes(q))
        );
      },

      searchUsers: (query) => {
        const q = query.toLowerCase();
        if (!q) return [];
        return get().users.filter(
          (u) =>
            u.username.toLowerCase().includes(q) ||
            u.displayName.toLowerCase().includes(q)
        );
      },

      resetDemo: () => set({ ...initialState, hydrated: true }),
    };
    },
    {
      name: "verso-store",
      skipHydration: true,
      partialize: (state) => {
        if (isSupabaseConfigured()) {
          return { offlineQueue: state.offlineQueue };
        }
        return {
          currentUserId: state.currentUserId,
          users: state.users,
          poems: state.poems,
          drafts: state.drafts,
          follows: state.follows,
          reactions: state.reactions,
          comments: state.comments,
          bookmarkCollections: state.bookmarkCollections,
          bookmarks: state.bookmarks,
          conversations: state.conversations,
          messages: state.messages,
          collaborativePoems: state.collaborativePoems,
          challenges: state.challenges,
          books: state.books,
          notifications: state.notifications,
          notificationMutes: state.notificationMutes,
          draftVersions: state.draftVersions,
          offlineQueue: state.offlineQueue,
        };
      },
    }
  )
);

export function useCurrentUser() {
  const currentUserId = useStore((s) => s.currentUserId);
  const users = useStore((s) => s.users);
  return useMemo(
    () => (currentUserId ? users.find((u) => u.id === currentUserId) ?? null : null),
    [currentUserId, users]
  );
}

export function useUser(id: string) {
  const users = useStore((s) => s.users);
  return useMemo(() => users.find((u) => u.id === id), [users, id]);
}

export function usePoem(id: string) {
  const poems = useStore((s) => s.poems);
  return useMemo(() => poems.find((p) => p.id === id), [poems, id]);
}

export function usePoemComments(poemId: string) {
  const comments = useStore((s) => s.comments);
  return useMemo(
    () => comments.filter((c) => c.poemId === poemId),
    [comments, poemId]
  );
}
