"use client";

import { AppHeader, EmptyState, PageShell } from "@/components/layout/bottom-nav";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { notificationLink, notificationMessage } from "@/lib/notification-text";
import { useStore, useUser } from "@/lib/store";
import { RelativeTime } from "@/components/ui/relative-time";
import { Bell } from "lucide-react";
import Link from "next/link";

function NotificationRow({
  id,
  actorId,
  type,
  poemId,
  read,
  createdAt,
}: {
  id: string;
  actorId: string;
  type: import("@/lib/types").NotificationType;
  poemId?: string;
  read: boolean;
  createdAt: string;
}) {
  const actor = useUser(actorId);
  const markRead = useStore((s) => s.markNotificationRead);
  const poems = useStore((s) => s.poems);
  const poem = poemId ? poems.find((p) => p.id === poemId) : undefined;

  if (!actor) return null;

  const href = notificationLink(type, poemId, actor.username);
  const message = notificationMessage(type, actor.displayName, poem?.title);

  return (
    <Link
      href={href}
      onClick={() => !read && markRead(id)}
      className={`block px-4 py-4 border-b border-border-faint active:bg-surface transition-colors ${
        !read ? "bg-accent-soft/30" : ""
      }`}
    >
      <div className="flex gap-3">
        <Avatar name={actor.displayName} color={actor.avatarColor} imageUrl={actor.avatarUrl} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-ink leading-snug">{message}</p>
          <RelativeTime date={createdAt} className="text-xs text-ink-dim mt-1" />
        </div>
        {!read && <span className="h-2 w-2 rounded-full bg-accent shrink-0 mt-2" />}
      </div>
    </Link>
  );
}

export default function NotificationsPage() {
  const currentUserId = useStore((s) => s.currentUserId);
  const notifications = useStore((s) => s.notifications);
  const markAllRead = useStore((s) => s.markAllNotificationsRead);

  const mine = notifications
    .filter((n) => n.userId === currentUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <PageShell>
      <AppHeader
        title="Notificações"
        action={
          mine.some((n) => !n.read) ? (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              Marcar lidas
            </Button>
          ) : undefined
        }
      />

      {mine.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Sem notificações"
          description="Quando alguém reagir, comentar ou publicar, aparece aqui."
        />
      ) : (
        <div>
          {mine.map((n) => (
            <NotificationRow key={n.id} {...n} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
