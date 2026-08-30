"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { Mic, Square, Play, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

export function PoemAudioRecorder({ poemId, audioUrl }: { poemId: string; audioUrl?: string }) {
  const setPoemAudio = useStore((s) => s.setPoemAudio);
  const [recording, setRecording] = useState(false);
  const [localUrl, setLocalUrl] = useState<string | null>(audioUrl ?? null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setLocalUrl(url);
        setPoemAudio(poemId, url);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      alert("Não foi possível aceder ao microfone.");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const removeAudio = () => {
    setLocalUrl(null);
    setPoemAudio(poemId, null);
  };

  return (
    <div className="rounded-xl border border-border-faint p-4 space-y-3">
      <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Leitura em voz</p>
      {localUrl ? (
        <div className="space-y-2">
          <audio controls src={localUrl} className="w-full h-10" />
          <Button variant="outline" size="sm" onClick={removeAudio}>
            <Trash2 className="h-4 w-4" />
            Remover áudio
          </Button>
        </div>
      ) : (
        <Button
          variant={recording ? "destructive" : "outline"}
          size="sm"
          onClick={recording ? stopRecording : startRecording}
        >
          {recording ? (
            <>
              <Square className="h-4 w-4" />
              Parar gravação
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Gravar leitura
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export function PoemAudioPlayer({ audioUrl }: { audioUrl: string }) {
  return (
    <div className="rounded-xl border border-border-faint p-4">
      <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <Play className="h-3.5 w-3.5" />
        Ouvir poema
      </p>
      <audio controls src={audioUrl} className="w-full h-10" />
    </div>
  );
}
