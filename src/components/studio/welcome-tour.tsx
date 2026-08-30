"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, PenLine, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "mipoetry-welcome-v1";

const slides = [
  {
    icon: PenLine,
    title: "Escreve como num documento",
    body: "Formatação rica, fontes, cores — o poema fica exactamente como o imaginas.",
  },
  {
    icon: BookOpen,
    title: "Antologias partilháveis",
    body: "Capa, dedicação, prefácio, poemas ordenados — um livro com link bonito.",
  },
  {
    icon: Users,
    title: "Comunidade de poetas",
    body: "Publica, recebe reacções, segue autores e descobre vozes novas.",
  },
];

export function WelcomeTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  if (!open) return null;

  const slide = slides[step];
  const Icon = slide.icon;
  const isLast = step === slides.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-ink/40 backdrop-blur-sm safe-top safe-bottom">
      <div className="glass-panel w-full max-w-sm p-6 animate-fade-up relative">
        <button
          type="button"
          onClick={close}
          className="absolute top-4 right-4 p-1 rounded-lg text-ink-dim hover:text-ink"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-4">
          <Icon className="h-6 w-6" />
        </div>

        <p className="text-xs font-medium text-accent mb-1">
          {step + 1} / {slides.length}
        </p>
        <h3 className="font-display text-xl font-bold text-ink mb-2">{slide.title}</h3>
        <p className="text-sm text-ink-muted leading-relaxed mb-6">{slide.body}</p>

        <div className="flex gap-1.5 mb-5">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-accent" : "bg-border"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {!isLast ? (
            <>
              <Button variant="ghost" className="flex-1" onClick={close}>
                Saltar
              </Button>
              <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>
                Seguinte
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={close}>
              Começar a escrever
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
