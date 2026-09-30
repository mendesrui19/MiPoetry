"use client";

import { cn } from "@/lib/cn";
import { resolvePoemStyle } from "@/lib/poem-style";
import { bodyToPlainText, poemBodyToHtml } from "@/lib/rich-text";
import { useMounted } from "@/lib/use-mounted";
import type { FontSize, FontStyle, ThemeStyle } from "@/lib/types";

interface PoemRichContentProps {
  body: string;
  font?: FontStyle;
  theme?: ThemeStyle;
  textColor?: string;
  fontSize?: FontSize;
  /** Clip visually without stripping inline formatting (feed cards). */
  clipped?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Renders poem body HTML with the writer's fonts, colours, alignment and emphasis. */
export function PoemRichContent({
  body,
  font,
  theme,
  textColor,
  fontSize,
  clipped = false,
  className,
  style,
}: PoemRichContentProps) {
  const mounted = useMounted();
  const resolved =
    font && theme ? resolvePoemStyle({ font, theme, textColor, fontSize }) : null;
  const html = poemBodyToHtml(body);
  const plainPreview = bodyToPlainText(body);

  return (
    <div
      className={cn(
        "poem-rich-content poem-body",
        resolved?.fontClassName,
        resolved?.fontSizeClassName,
        clipped && "poem-rich-content--clipped",
        className
      )}
      style={{
        color: resolved?.textColor ?? textColor,
        ...style,
      }}
    >
      {mounted ? (
        <div
          className={cn(clipped && "poem-rich-content__clip")}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className={cn(clipped && "poem-rich-content__clip", "whitespace-pre-wrap")}>
          {plainPreview}
        </div>
      )}
    </div>
  );
}

interface PoemRichBlockProps {
  title?: string;
  body: string;
  font: FontStyle;
  theme: ThemeStyle;
  textColor: string;
  fontSize: FontSize;
  authorName?: string;
  clipped?: boolean;
  className?: string;
  bodyClassName?: string;
}

/** Styled poem block with theme background — canonical display everywhere. */
export function PoemRichBlock({
  title,
  body,
  font,
  theme,
  textColor,
  fontSize,
  authorName,
  clipped = false,
  className,
  bodyClassName,
}: PoemRichBlockProps) {
  const resolved = resolvePoemStyle({ font, theme, textColor, fontSize });

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden shadow-sm",
        resolved.bg,
        resolved.border,
        className
      )}
    >
      <div className="px-5 py-6">
        {authorName && (
          <p
            className="text-xs opacity-50 mb-4 font-sans tracking-wide uppercase"
            style={{ color: resolved.textColor }}
          >
            {authorName}
          </p>
        )}
        {title?.trim() && (
          <h2
            className={cn("text-base font-semibold tracking-tight mb-4", resolved.fontClassName)}
            style={{ color: resolved.textColor }}
          >
            {title}
          </h2>
        )}
        <PoemRichContent
          body={body}
          font={font}
          theme={theme}
          textColor={textColor}
          fontSize={fontSize}
          clipped={clipped}
          className={bodyClassName}
        />
      </div>
    </div>
  );
}
