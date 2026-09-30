"use client";

import { bookSectionTitle, sortBookSections } from "@/lib/book-sections";
import { cn } from "@/lib/cn";
import { bodyToPlainText, poemBodyToHtml } from "@/lib/rich-text";
import { useMounted } from "@/lib/use-mounted";
import type { BookSection } from "@/lib/types";

interface BookSectionsViewProps {
  sections: BookSection[];
  placement: "front" | "back";
  variant?: "default" | "book";
}

export function BookSectionsView({
  sections,
  placement,
  variant = "default",
}: BookSectionsViewProps) {
  const mounted = useMounted();
  const items = sortBookSections(sections, placement).filter((s) => s.body.trim());
  if (items.length === 0) return null;

  const isBook = variant === "book";

  return (
    <div className={cn(isBook ? "book-reader__sections" : "space-y-10")}>
      {items.map((section) => (
        <section
          key={section.id}
          id={isBook ? `section-${section.id}` : undefined}
          className={cn(
            isBook
              ? "book-reader__section"
              : "text-center max-w-md mx-auto"
          )}
        >
          <p
            className={cn(
              isBook
                ? "book-reader__section-label"
                : "text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted mb-4"
            )}
          >
            {bookSectionTitle(section.type, section.title)}
          </p>
          {isBook ? (
            mounted ? (
              <div
                className="book-reader__section-body font-classic"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                  __html: poemBodyToHtml(section.body),
                }}
              />
            ) : (
              <div className="book-reader__section-body font-classic whitespace-pre-wrap">
                {bodyToPlainText(section.body)}
              </div>
            )
          ) : (
            <div className="font-classic text-base leading-relaxed text-ink whitespace-pre-wrap">
              {section.body}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
