"use client";

import { AppHeader, EmptyState, PageShell, StickyHeader } from "@/components/layout/bottom-nav";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, useUser } from "@/lib/store";
import { RelativeTime } from "@/components/ui/relative-time";
import { ArrowLeft, PenLine, Send } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function MessagesContent() {
  const searchParams = useSearchParams();
  const currentUserId = useStore((s) => s.currentUserId);
  const conversations = useStore((s) => s.conversations);
  const messages = useStore((s) => s.messages);
  const collaborativePoems = useStore((s) => s.collaborativePoems);
  const sendMessage = useStore((s) => s.sendMessage);
  const addCollabVerse = useStore((s) => s.addCollabVerse);
  const markConversationRead = useStore((s) => s.markConversationRead);
  const [activeConv, setActiveConv] = useState<string | null>(
    searchParams.get("conv")
  );
  const [activeCollab, setActiveCollab] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [tab, setTab] = useState<"messages" | "collab">("messages");

  useEffect(() => {
    const conv = searchParams.get("conv");
    if (conv) setActiveConv(conv);
  }, [searchParams]);

  useEffect(() => {
    if (activeConv) {
      markConversationRead(activeConv);
    }
  }, [activeConv, markConversationRead]);

  const myConversations = conversations
    .filter((c) => currentUserId && c.participantIds.includes(currentUserId))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const myCollabs = collaborativePoems.filter(
    (c) => currentUserId && c.participantIds.includes(currentUserId)
  );

  if (activeCollab) {
    const collab = collaborativePoems.find((c) => c.id === activeCollab);
    if (!collab) return null;

    return (
      <PageShell>
        <StickyHeader>
          <button onClick={() => setActiveCollab(null)} className="p-1 -ml-1" aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-classic text-lg font-semibold truncate">{collab.title}</h1>
        </StickyHeader>
        <div className="content-above-input px-4 py-4 space-y-3">
          {collab.verses
            .sort((a, b) => a.order - b.order)
            .map((verse, i) => (
              <CollabVerse key={i} authorId={verse.authorId} text={verse.text} />
            ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            addCollabVerse(activeCollab, text);
            setText("");
          }}
          className="sticky-input-bar flex gap-2 bg-paper/95 backdrop-blur-md pt-2"
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreve o próximo verso..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <PenLine className="h-4 w-4" />
          </Button>
        </form>
      </PageShell>
    );
  }

  if (activeConv) {
    const convMessages = messages
      .filter((m) => m.conversationId === activeConv)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const conv = conversations.find((c) => c.id === activeConv);
    const otherId = conv?.participantIds.find((id) => id !== currentUserId);
    const other = otherId ? useStore.getState().users.find((u) => u.id === otherId) : null;

    return (
      <PageShell>
        <StickyHeader>
          <button onClick={() => setActiveConv(null)} className="p-1 -ml-1" aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </button>
          {other && (
            <>
              <Avatar name={other.displayName} color={other.avatarColor} size="sm" />
              <span className="font-medium text-ink truncate">{other.displayName}</span>
            </>
          )}
        </StickyHeader>
        <div className="content-above-input flex flex-col gap-3 px-4 py-4">
          {convMessages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.senderId === currentUserId
                  ? "ml-auto bg-accent text-white"
                  : "bg-surface text-ink border border-border-faint"
              }`}
            >
              {msg.body}
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            sendMessage(activeConv, text);
            setText("");
          }}
          className="sticky-input-bar flex gap-2 bg-paper/95 backdrop-blur-md pt-2"
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreve uma mensagem..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AppHeader title="Mensagens" />
      <div className="flex gap-2 px-4 py-3">
        <button
          onClick={() => setTab("messages")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium ${
            tab === "messages" ? "bg-accent text-white" : "bg-surface text-ink-muted"
          }`}
        >
          Conversas
        </button>
        <button
          onClick={() => setTab("collab")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium ${
            tab === "collab" ? "bg-accent text-white" : "bg-surface text-ink-muted"
          }`}
        >
          Colaborativos
        </button>
      </div>

      {tab === "messages" ? (
        myConversations.length === 0 ? (
          <EmptyState
            title="Sem mensagens"
            description="Visita o perfil de um autor e inicia uma conversa."
          />
        ) : (
          <div className="divide-y divide-border-faint">
            {myConversations.map((conv) => (
              <ConversationRow
                key={conv.id}
                conv={conv}
                currentUserId={currentUserId!}
                onOpen={() => setActiveConv(conv.id)}
              />
            ))}
          </div>
        )
      ) : myCollabs.length === 0 ? (
        <EmptyState
          title="Sem poemas colaborativos"
          description="Convida alguém numa conversa para escreverem versos alternados."
        />
      ) : (
        <div className="divide-y divide-border-faint">
          {myCollabs.map((collab) => (
            <button
              key={collab.id}
              onClick={() => setActiveCollab(collab.id)}
              className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-surface transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-accent/15 flex items-center justify-center">
                <PenLine className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">{collab.title}</p>
                <p className="text-xs text-ink-dim">{collab.verses.length} versos · {collab.status}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </PageShell>
  );
}

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesContent />
    </Suspense>
  );
}

function ConversationRow({
  conv,
  currentUserId,
  onOpen,
}: {
  conv: { id: string; participantIds: string[]; updatedAt: string };
  currentUserId: string;
  onOpen: () => void;
}) {
  const otherId = conv.participantIds.find((id) => id !== currentUserId)!;
  const other = useUser(otherId);
  const messages = useStore((s) => s.messages);
  const lastMsg = useMemo(
    () =>
      messages
        .filter((m) => m.conversationId === conv.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0],
    [messages, conv.id]
  );

  if (!other) return null;

  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-surface transition-colors"
    >
      <Avatar name={other.displayName} color={other.avatarColor} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">{other.displayName}</p>
          {lastMsg && (
            <RelativeTime date={lastMsg.createdAt} className="text-xs text-ink-dim" />
          )}
        </div>
        {lastMsg && (
          <p className="text-sm text-ink-muted truncate">{lastMsg.body}</p>
        )}
      </div>
    </button>
  );
}

function CollabVerse({ authorId, text }: { authorId: string; text: string }) {
  const author = useUser(authorId);
  return (
    <div className="rounded-xl bg-surface border border-border-faint p-4">
      <p className="font-classic text-base leading-relaxed poem-body">{text}</p>
      {author && (
        <p className="text-xs text-ink-dim mt-2">— {author.displayName}</p>
      )}
    </div>
  );
}
