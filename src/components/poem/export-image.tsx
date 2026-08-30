"use client";

import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { PoemRichBlock } from "@/components/poem/poem-rich-content";
import { EXPORT_TEMPLATES, getExportTemplate, type ExportTemplateId } from "@/lib/export-templates";
import { bodyToPlainText } from "@/lib/rich-text";
import { cn } from "@/lib/cn";
import type { Poem } from "@/lib/types";
import { useUser } from "@/lib/store";
import { Download, FileText } from "lucide-react";
import { useRef, useState } from "react";

export function ExportPoemImage({ poem }: { poem: Poem }) {
  const ref = useRef<HTMLDivElement>(null);
  const author = useUser(poem.authorId);
  const [templateId, setTemplateId] = useState<ExportTemplateId>("classic");
  const template = getExportTemplate(templateId);

  const handleExportPng = async () => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${poem.title.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert("Não foi possível exportar a imagem.");
    }
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.setFont("times");
    doc.setFontSize(18);
    doc.text(poem.title, 20, 30);
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(bodyToPlainText(poem.body), 170);
    doc.text(lines, 20, 45);
    if (author) {
      doc.setFontSize(10);
      doc.text(`— ${author.displayName}`, 20, 280);
    }
    doc.save(`${poem.title.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {EXPORT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTemplateId(t.id)}
            className={cn(
              "text-xs px-2.5 py-1 rounded-lg border transition-colors",
              templateId === t.id
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-ink-muted"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="hidden">
        <div ref={ref} style={{ width: template.width }}>
          <PoemRichBlock
            title={poem.title}
            body={poem.body}
            font={poem.font}
            theme={poem.theme}
            textColor={poem.textColor}
            fontSize={poem.fontSize}
            authorName={author?.displayName}
            className={cn("rounded-none border-0", template.className)}
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={handleExportPng}>
          <Download className="h-4 w-4" />
          Imagem
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPdf}>
          <FileText className="h-4 w-4" />
          PDF
        </Button>
      </div>
    </div>
  );
}
