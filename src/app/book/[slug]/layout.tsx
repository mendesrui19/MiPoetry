import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://mipoetry.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const url = `${SITE_URL}/book/${slug}`;
  const fallback: Metadata = {
    title: "Antologia · MiPoetry",
    description: "Livro de poemas na MiPoetry",
  };

  if (!isSupabaseConfigured()) return fallback;

  try {
    const supabase = await createClient();
    const { data: book } = await supabase
      .from("books")
      .select("title, description, is_public")
      .eq("slug", slug)
      .eq("is_public", true)
      .maybeSingle();

    if (!book) return fallback;

    const description =
      book.description?.trim().slice(0, 160) ||
      `Antologia «${book.title}» — MiPoetry`;

    return {
      title: `${book.title} · MiPoetry`,
      description,
      openGraph: {
        title: book.title,
        description,
        url,
        siteName: "MiPoetry",
        type: "book",
      },
      twitter: {
        card: "summary",
        title: book.title,
        description,
      },
      alternates: { canonical: url },
    };
  } catch {
    return fallback;
  }
}

export default function BookRouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
