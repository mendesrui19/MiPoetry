import { fetchPoemForMetadata } from "@/lib/supabase/api";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { bodyToPlainText } from "@/lib/rich-text";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function PoemOgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let title = "MiPoetry";
  let author = "Poema";
  let excerpt = "Rede social de poesia em português";

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const poem = await fetchPoemForMetadata(supabase, id);
      if (poem) {
        title = poem.title || "Sem título";
        author = poem.authorName;
        excerpt = bodyToPlainText(poem.body).trim().slice(0, 180);
      }
    } catch {
      /* fallback */
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(145deg, #fafaf9 0%, #fff1f2 55%, #fafaf9 100%)",
          color: "#1c1917",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: "#be123c",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            M
          </div>
          <span style={{ fontSize: 22, letterSpacing: 4, color: "#be123c", fontWeight: 600 }}>
            MIPOETRY
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.15, maxHeight: 180, overflow: "hidden" }}>
            {title}
          </div>
          <div style={{ fontSize: 28, color: "#57534e", lineHeight: 1.45, maxHeight: 120, overflow: "hidden" }}>
            {excerpt || "…"}
          </div>
        </div>

        <div style={{ fontSize: 24, color: "#be123c" }}>— {author}</div>
      </div>
    ),
    { ...size }
  );
}
