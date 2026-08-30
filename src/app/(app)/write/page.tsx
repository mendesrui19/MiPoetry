"use client";

import { StickyHeader, PageShell } from "@/components/layout/bottom-nav";
import { PoemEditor } from "@/components/editor/poem-editor";
import { usePoem, useStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function WriteContent() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft") ?? undefined;
  const editId = searchParams.get("edit") ?? undefined;
  const drafts = useStore((s) => s.drafts);
  const draft = draftId ? drafts.find((d) => d.id === draftId) : undefined;
  const poem = usePoem(editId ?? "");

  if (editId && poem) {
    return (
      <PoemEditor
        poemId={editId}
        initial={{
          title: poem.title,
          body: poem.body,
          font: poem.font,
          theme: poem.theme,
          textColor: poem.textColor,
          fontSize: poem.fontSize,
          privacy: poem.privacy,
        }}
      />
    );
  }

  return (
    <PoemEditor
      draftId={draftId}
      initial={
        draft
          ? {
              title: draft.title,
              body: draft.body,
              font: draft.font,
              theme: draft.theme,
              textColor: draft.textColor,
              fontSize: draft.fontSize,
              privacy: draft.privacy,
            }
          : undefined
      }
    />
  );
}

function WriteHeader() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const draftId = searchParams.get("draft");
  const title = editId ? "Editar" : draftId ? "Rascunho" : "Escrever";

  return (
    <StickyHeader>
      <Link href="/feed" className="p-1 -ml-1 shrink-0" aria-label="Voltar">
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <h1 className="font-display text-base font-semibold tracking-tight">{title}</h1>
    </StickyHeader>
  );
}

export default function WritePage() {
  return (
    <PageShell className="page-shell--immersive">
      <Suspense>
        <WriteHeader />
        <WriteContent />
      </Suspense>
    </PageShell>
  );
}
