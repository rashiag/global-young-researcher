"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { GameBlueprint } from "@/types/gameBlueprint";
import { STARTER_TEMPLATES } from "@/lib/gameStudio/starterTemplates";
import { validateBlueprint } from "@/lib/gameStudio/validator";
import StageCanvas from "@/components/gameStudio/StageCanvas";

function decodeBlueprintParam(rawParam: string | null): GameBlueprint | null {
  if (!rawParam) return null;
  try {
    const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(rawParam))));
    return JSON.parse(jsonStr) as GameBlueprint;
  } catch {
    try {
      const jsonStr = decodeURIComponent(escape(atob(rawParam)));
      return JSON.parse(jsonStr) as GameBlueprint;
    } catch {
      return null;
    }
  }
}

function PlayGameContent() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const [sessionKey, setSessionKey] = useState(0);

  const blueprint = useMemo<GameBlueprint>(() => {
    const fallback = STARTER_TEMPLATES[0].blueprint;
    const decoded = decodeBlueprintParam(searchParams.get("bp"));
    if (decoded) {
      return validateBlueprint(decoded, fallback);
    }
    const matchedTemplate = STARTER_TEMPLATES.find((t) => t.id === params?.slug);
    if (matchedTemplate) {
      return validateBlueprint(matchedTemplate.blueprint, fallback);
    }
    return fallback;
  }, [params?.slug, searchParams]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Studio
          </Link>
          <h1 className="text-sm sm:text-base font-bold text-white">{blueprint.title}</h1>
        </div>

        <button
          type="button"
          onClick={() => setSessionKey((k) => k + 1)}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restart
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <StageCanvas
          lang="en"
          mode="play"
          playSessionKey={sessionKey}
          blueprint={blueprint}
          selectedEntityId={null}
          onSelectEntity={() => {}}
          onUpdateEntity={() => {}}
          onDuplicateEntity={() => {}}
          onDeleteEntity={() => {}}
          onDropSpriteAsset={() => {}}
          onRestartPlay={() => setSessionKey((k) => k + 1)}
        />
      </main>
    </div>
  );
}

export default function PlayGamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-300 p-6">Loading game...</div>}>
      <PlayGameContent />
    </Suspense>
  );
}