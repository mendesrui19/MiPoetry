"use client";

import { bookSectionTitle } from "@/lib/book-sections";
import { BookSectionsView } from "@/components/books/book-sections-view";
import { PoemRichBlock } from "@/components/poem/poem-rich-content";
import { Avatar } from "@/components/ui/avatar";
import type { Book, Poem, User } from "@/lib/types";
import { BookOpen } from "lucide-react";
import Link from "next/link";

interface BookReaderProps {
  book: Book;
  author: User;
  poems: Poem[];
}

export function BookReader({ book, author, poems }: BookReaderProps) {
  const frontSections = (book.sections ?? []).filter(
    (s) => s.placement === "front" && s.body.trim()
  );
  const backSections = (book.sections ?? []).filter(
    (s) => s.placement === "back" && s.body.trim()
  );
  const showToc =
    poems.length > 1 || frontSections.length > 0 || backSections.length > 0;

  return (
    <article className="book-reader">
      {/* Capa / página de rosto */}
      <header className="book-reader__title-page">
        {book.coverUrl ? (
          <div className="book-reader__cover">
            <img src={book.coverUrl} alt={`Capa de ${book.title}`} />
          </div>
        ) : (
          <div className="book-reader__cover book-reader__cover--placeholder">
            <BookOpen className="h-10 w-10 text-accent/60 mb-4" />
          </div>
        )}
        <h1 className="book-reader__title">{book.title}</h1>
        {book.description && (
          <p className="book-reader__subtitle">{book.description}</p>
        )}
        <Link href={`/profile/${author.username}`} className="book-reader__author">
          <Avatar
            name={author.displayName}
            color={author.avatarColor}
            imageUrl={author.avatarUrl}
            size="sm"
          />
          <span>{author.displayName}</span>
        </Link>
      </header>

      {showToc && (
        <nav className="book-reader__toc" aria-label="Índice">
          <p className="book-reader__section-label">Índice</p>
          <ol className="book-reader__toc-list">
            {frontSections.map((s) => (
              <li key={s.id}>
                <a href={`#section-${s.id}`}>
                  {bookSectionTitle(s.type, s.title)}
                </a>
              </li>
            ))}
            {poems.map((poem, i) => (
              <li key={poem.id}>
                <a href={`#poem-${poem.id}`}>
                  {poem.title?.trim() || `Poema ${i + 1}`}
                </a>
              </li>
            ))}
            {backSections.map((s) => (
              <li key={s.id}>
                <a href={`#section-${s.id}`}>
                  {bookSectionTitle(s.type, s.title)}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <BookSectionsView sections={book.sections ?? []} placement="front" variant="book" />

      {frontSections.length > 0 && poems.length > 0 && (
        <div className="book-reader__divider" aria-hidden />
      )}

      <div className="book-reader__body">
        {poems.map((poem, index) => (
          <section
            key={poem.id}
            id={`poem-${poem.id}`}
            className="book-reader__poem"
          >
            {poems.length > 1 && (
              <p className="book-reader__poem-index">{index + 1}</p>
            )}
            <PoemRichBlock
              title={poem.title}
              body={poem.body}
              font={poem.font}
              theme={poem.theme}
              textColor={poem.textColor}
              fontSize={poem.fontSize}
              className="book-reader__poem-block"
            />
          </section>
        ))}
      </div>

      {backSections.length > 0 && poems.length > 0 && (
        <div className="book-reader__divider" aria-hidden />
      )}

      <BookSectionsView sections={book.sections ?? []} placement="back" variant="book" />

      <footer className="book-reader__end">
        <span className="book-reader__ornament" aria-hidden>
          ✦
        </span>
        <p>Fim</p>
      </footer>
    </article>
  );
}
