import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { fetchPoemForMetadata } from "@/lib/supabase/api";
import { bodyToPlainText } from "@/lib/rich-text";
import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://mipoetry.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const fallback: Metadata = {
    title: "Poema · MiPoetry",
    description: "Rede social de poesia",
  };

  if (!isSupabaseConfigured()) return fallback;

  try {
    const supabase = await createClient();
    const poem = await fetchPoemForMetadata(supabase, id);
    if (!poem) return fallback;

    const excerpt = bodyToPlainText(poem.body).trim().slice(0, 160);
    const url = `${SITE_URL}/poem/${id}`;
    const description = excerpt
      ? `${poem.authorName} — ${excerpt}${excerpt.length >= 160 ? "…" : ""}`
      : `Poema de ${poem.authorName} na MiPoetry`;

    return {
      title: `${poem.title} · ${poem.authorName}`,
      description,
      openGraph: {
        title: poem.title,
        description,
        url,
        siteName: "MiPoetry",
        type: "article",
        locale: "pt_PT",
      },
      twitter: {
        card: "summary",
        title: poem.title,
        description,
      },
      alternates: { canonical: url },
    };
  } catch {
    return fallback;
  }
}

export default function PoemRouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
