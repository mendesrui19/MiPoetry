"use client";

import { AppHeader, EmptyState, PageShell } from "@/components/layout/bottom-nav";
import { BookDiscoverCard, BookDiscoverRow } from "@/components/books/book-discover-card";
import { SuggestedAuthorsRow } from "@/components/discover/suggested-authors-row";
import { WeeklyChallengeCard } from "@/components/discover/weekly-challenge-card";
import { PoemCard } from "@/components/poem/poem-card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type SearchTab = "poems" | "users" | "books";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<SearchTab>("poems");
  const searchPoems = useStore((s) => s.searchPoems);
  const searchUsers = useStore((s) => s.searchUsers);
  const searchBooks = useStore((s) => s.searchBooks);
  const getFeedDiscover = useStore((s) => s.getFeedDiscover);
  const getDiscoverBooks = useStore((s) => s.getDiscoverBooks);
  const users = useStore((s) => s.users);

  const discoverPoems = getFeedDiscover().slice(0, 10);
  const discoverBooks = getDiscoverBooks();
  const poems = query ? searchPoems(query) : discoverPoems;
  const matchedUsers = query ? searchUsers(query) : [];
  const matchedBooks = query ? searchBooks(query) : [];

  const getTrendingHashtags = useStore((s) => s.getTrendingHashtags);
  const trendingTags = getTrendingHashtags();

  useEffect(() => {
    try {
      localStorage.setItem("mipoetry-visited-discover", "1");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <>
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-dim" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar poemas, autores, antologias..."
            className="pl-10"
          />
        </div>
      </div>

      {query ? (
        <div className="px-4 pb-3">
          <Tabs
            tabs={[
              { id: "poems", label: "Poemas" },
              { id: "users", label: "Autores" },
              { id: "books", label: "Antologias" },
            ]}
            active={tab}
            onChange={(id) => setTab(id as SearchTab)}
          />
        </div>
      ) : (
        <>
          <WeeklyChallengeCard />
          <SuggestedAuthorsRow />
          <BookDiscoverRow books={discoverBooks} users={users} />
          <div className="px-4 pb-4">
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">
              Tendências
            </p>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${tag}`}
                  className="px-3 py-1.5 rounded-full bg-surface border border-border text-sm text-ink-muted hover:border-accent hover:text-accent transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {query && tab === "users" ? (
        matchedUsers.length === 0 ? (
          <EmptyState title="Nenhum autor encontrado" description="Tenta outro termo de pesquisa." />
        ) : (
          <div className="divide-y divide-border-faint">
            {matchedUsers.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-3 px-4 py-3 active:bg-surface transition-colors"
              >
                <Avatar name={user.displayName} color={user.avatarColor} />
                <div>
                  <p className="text-sm font-semibold text-ink">{user.displayName}</p>
                  <p className="text-xs text-ink-dim">@{user.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : query && tab === "books" ? (
        matchedBooks.length === 0 ? (
          <EmptyState
            title="Nenhuma antologia encontrada"
            description="Tenta outro termo ou explora as antologias públicas."
          />
        ) : (
          <div className="grid grid-cols-3 gap-4 px-4 pb-4">
            {matchedBooks.map((book) => (
              <BookDiscoverCard
                key={book.id}
                book={book}
                author={users.find((u) => u.id === book.authorId)}
                compact
              />
            ))}
          </div>
        )
      ) : poems.length === 0 ? (
        <EmptyState
          title="Sem resultados"
          description={query ? "Não encontrámos poemas com esse termo." : "Explora as hashtags ou antologias acima."}
        />
      ) : (
        <div>
          {!query && (
            <p className="px-4 pb-2 text-xs font-medium text-ink-muted uppercase tracking-wide">
              Poemas em destaque
            </p>
          )}
          {poems.map((poem) => (
            <PoemCard key={poem.id} poem={poem} compact={!!query} readContext="discover" />
          ))}
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <PageShell>
      <AppHeader title="Descobrir" />
      <Suspense>
        <SearchContent />
      </Suspense>
    </PageShell>
  );
}
