/** Detect if poem body is stored as HTML rich text. */
export function isRichBody(body: string): boolean {
  return /<[a-z][\s\S]*>/i.test(body.trim());
}

/** Strip HTML tags to plain text (preserves line breaks from block elements). */
export function bodyToPlainText(body: string): string {
  if (!body) return "";
  if (!isRichBody(body)) return body;

  return body
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<\/div>\s*<div[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/** Convert legacy plain-text poem body to minimal HTML for the editor. */
export function plainTextToHtml(text: string): string {
  if (!text.trim()) return "";
  if (isRichBody(text)) return text;

  return text
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n").map((line) => line || "<br>");
      return `<p>${lines.join("<br>")}</p>`;
    })
    .join("");
}

/** Empty editor document. */
export function emptyPoemHtml(): string {
  return "<p></p>";
}

/** Short preview for search snippets and metadata — plain text only. */
export function bodyPreview(body: string, maxLength = 120): string {
  const plain = bodyToPlainText(body).replace(/\s+/g, " ").trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()}…`;
}

/** Normalize poem body to safe HTML, preserving writer formatting. */
export function poemBodyToHtml(body: string): string {
  if (!body.trim()) return "<p></p>";
  const html = isRichBody(body) ? body : plainTextToHtml(body);
  return sanitizePoemHtml(html);
}

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "span",
  "mark",
  "div",
]);

const ALLOWED_STYLE_PROPS = new Set([
  "color",
  "background-color",
  "font-family",
  "font-size",
  "text-align",
  "text-decoration",
  "font-weight",
  "font-style",
]);

function sanitizeStyleValue(value: string): string {
  return value
    .replace(/javascript:/gi, "")
    .replace(/expression\s*\(/gi, "")
    .replace(/url\s*\(/gi, "")
    .trim();
}

function sanitizeStyleAttr(style: string): string {
  const parts = style
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  const safe = parts
    .map((part) => {
      const colon = part.indexOf(":");
      if (colon === -1) return null;
      const prop = part.slice(0, colon).trim().toLowerCase();
      const val = sanitizeStyleValue(part.slice(colon + 1));
      if (!ALLOWED_STYLE_PROPS.has(prop) || !val) return null;
      return `${prop}: ${val}`;
    })
    .filter(Boolean);

  return safe.join("; ");
}

function extractSafeAttrs(attrs: string): string {
  const kept: string[] = [];
  const styleMatch = attrs.match(/\sstyle=(["'])([\s\S]*?)\1/i);
  if (styleMatch) {
    const safe = sanitizeStyleAttr(styleMatch[2]);
    if (safe) kept.push(` style="${safe}"`);
  }
  return kept.join("");
}

export function sanitizePoemHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/on\w+=(["'])[\s\S]*?\1/gi, "")
    .replace(/<(\/?)([\w]+)([^>]*)>/g, (_match, slash, tag, attrs) => {
      const t = tag.toLowerCase();
      if (!ALLOWED_TAGS.has(t)) return "";
      if (slash) return `</${t}>`;
      return `<${t}${extractSafeAttrs(attrs)}>`;
    });
}
