"use client";

import React, { useRef, useState } from "react";
import { Sparkles, Mic, Wand2, ToggleLeft, ToggleRight, Trash2, UserSquare2 } from "lucide-react";
import { GameEntity, GameRule, PromptInputs } from "@/types/gameBlueprint";

interface PromptStudioProps {
  lang: "en" | "hi";
  entities: GameEntity[];
  rules: GameRule[];
  prompts: PromptInputs;
  isCompiling: boolean;
  agentBanner: {
    en: string;
    hi: string;
    tone: "info" | "fixed" | "ok";
  } | null;
  onChangePrompts: (next: PromptInputs) => void;
  onUpdateEntityPrompt: (entityId: string, logicPrompt: string) => void;
  onCompile: () => void;
  onRunDebugAgent: () => void;
  onToggleRule: (ruleId: string) => void;
  onDeleteRule: (ruleId: string) => void;
}

type PromptFieldKey = keyof PromptInputs;

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
}

export default function PromptStudio({
  lang,
  entities,
  rules,
  prompts,
  isCompiling,
  agentBanner,
  onChangePrompts,
  onUpdateEntityPrompt,
  onCompile,
  onRunDebugAgent,
  onToggleRule,
  onDeleteRule,
}: PromptStudioProps) {
  const [activeField, setActiveField] = useState<PromptFieldKey>("movement");
  const [listeningField, setListeningField] = useState<PromptFieldKey | null>(null);
  const inputRefs = useRef<Record<PromptFieldKey, HTMLTextAreaElement | null>>({
    gameIdea: null,
    movement: null,
    interactions: null,
    scoring: null,
    stopPoint: null,
  });

  const boxes: Array<{
    key: PromptFieldKey;
    labelEn: string;
    labelHi: string;
    phEn: string;
    phHi: string;
  }> = [
    {
      key: "gameIdea",
      labelEn: "1. Game Idea",
      labelHi: "1. गेम का विचार",
      phEn: "e.g. Help Bittu catch falling mangoes while dodging the crow.",
      phHi: "जैसे: बिट्टू को गिरते आम पकड़ने में मदद करें और कौए से बचें।",
    },
    {
      key: "movement",
      labelEn: "2. Movement & Controls",
      labelHi: "2. चाल और नियंत्रण",
      phEn: "e.g. Bittu moves left/right. Crow flies in a straight line toward Bittu.",
      phHi: "जैसे: बिट्टू बाएँ-दाएँ चले। कौआ बिट्टू की ओर सीधी रेखा में उड़े।",
    },
    {
      key: "interactions",
      labelEn: "3. What Happens on Touch",
      labelHi: "3. छूने पर क्या हो",
      phEn: "e.g. Touching Mango gives pop sound & respawns. Touching Crow loses 1 life.",
      phHi: "जैसे: आम छूने पर पॉप आवाज़ और नया आम। कौआ छूने पर 1 जीवन कम।",
    },
    {
      key: "scoring",
      labelEn: "4. Points & Lives",
      labelHi: "4. अंक और जीवन",
      phEn: "e.g. +10 score for Mango. Start with 3 lives.",
      phHi: "जैसे: आम पर +10 अंक। 3 जीवन से शुरू करें।",
    },
    {
      key: "stopPoint",
      labelEn: "5. Win / Stop Point",
      labelHi: "5. जीत / रुकने का बिंदु",
      phEn: "e.g. Win at 50 points, or lose when 0 lives remain.",
      phHi: "जैसे: 50 अंक पर जीत, या 0 जीवन पर खेल समाप्त।",
    },
  ];

  const insertMention = (entityName: string) => {
    const token = `@${entityName} `;
    const currentText = prompts[activeField] ?? "";
    const el = inputRefs.current[activeField];

    if (el && typeof el.selectionStart === "number" && typeof el.selectionEnd === "number") {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const updated = currentText.slice(0, start) + token + currentText.slice(end);
      onChangePrompts({ ...prompts, [activeField]: updated });
      requestAnimationFrame(() => {
        el.focus();
        const cursor = start + token.length;
        el.setSelectionRange(cursor, cursor);
      });
    } else {
      onChangePrompts({ ...prompts, [activeField]: `${currentText}${token}` });
    }
  };

  const handleVoiceInput = (field: PromptFieldKey) => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = lang === "hi" ? "hi-IN" : "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    setListeningField(field);
    setActiveField(field);

    rec.onresult = (event) => {
      const spoken = event.results?.[0]?.[0]?.transcript ?? "";
      if (spoken) {
        const prev = prompts[field] ? `${prompts[field].trim()} ` : "";
        onChangePrompts({ ...prompts, [field]: `${prev}${spoken}` });
      }
    };
    rec.onerror = () => setListeningField(null);
    rec.onend = () => setListeningField(null);
    rec.start();
  };

  return (
    <aside className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
          {lang === "en" ? "Sprite & Game Logic" : "स्प्राइट और गेम लॉजिक"}
        </h2>
        <span className="text-[11px] text-slate-400">
          {lang === "en" ? "Text-based Scratch" : "टेक्स्ट आधारित स्क्रैच"}
        </span>
      </div>

      {/* Per-Sprite Logic Text Areas */}
      <div className="space-y-2 rounded-xl border border-cyan-500/30 bg-slate-950/75 p-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300">
          <UserSquare2 className="w-3.5 h-3.5" />
          <span>
            {lang === "en" ? "Each Sprite's Logic" : "हर स्प्राइट का लॉजिक"}
          </span>
        </div>

        {entities.length === 0 ? (
          <p className="text-[11px] text-slate-500">
            {lang === "en" ? "Add a sprite on the stage to write its logic." : "स्टेज पर स्प्राइट जोड़ें।"}
          </p>
        ) : (
          <div className="space-y-2">
            {entities.map((ent) => (
              <div key={ent.id} className="rounded-lg bg-slate-900/90 border border-slate-800 p-2">
                <div className="flex items-center justify-between mb-1">
                  <button
                    type="button"
                    onClick={() => insertMention(ent.name)}
                    className="text-[11px] font-bold text-indigo-300 hover:text-indigo-200"
                    title={lang === "en" ? "Insert @mention" : "@नाम जोड़ें"}
                  >
                    @{ent.name}
                  </button>
                  <span className="text-[10px] text-slate-400">
                    {ent.behavior.type} · spd {ent.behavior.speed}
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={ent.logicPrompt ?? ""}
                  onChange={(e) => onUpdateEntityPrompt(ent.id, e.target.value)}
                  placeholder={
                    lang === "en"
                      ? `How should ${ent.name} move or act?`
                      : `${ent.name} कैसे चले या व्यवहार करे?`
                  }
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-md px-2 py-1 text-[11px] text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-cyan-500/60"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5 Game Logic Boxes */}
      <div className="space-y-2">
        {boxes.map((box) => {
          const isListening = listeningField === box.key;
          return (
            <div
              key={box.key}
              className={`rounded-xl border p-2 transition ${
                activeField === box.key
                  ? "border-indigo-500/70 bg-slate-950/90"
                  : "border-slate-800 bg-slate-950/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor={`prompt-${box.key}`}
                  className="text-[11px] font-semibold text-slate-200"
                >
                  {lang === "en" ? box.labelEn : box.labelHi}
                </label>
                <button
                  type="button"
                  onClick={() => handleVoiceInput(box.key)}
                  className={`p-1 rounded-md transition ${
                    isListening
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                  title={lang === "en" ? "Speak prompt" : "बोलकर लिखें"}
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                id={`prompt-${box.key}`}
                ref={(el) => {
                  inputRefs.current[box.key] = el;
                }}
                rows={2}
                value={prompts[box.key]}
                onFocus={() => setActiveField(box.key)}
                onChange={(e) => onChangePrompts({ ...prompts, [box.key]: e.target.value })}
                placeholder={lang === "en" ? box.phEn : box.phHi}
                className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 resize-none focus:outline-none leading-relaxed"
              />
            </div>
          );
        })}
      </div>

      {/* Action Buttons: Build + Test & Fix Agent */}
      <div className="grid grid-cols-1 gap-2 pt-0.5">
        <button
          type="button"
          disabled={isCompiling}
          onClick={onCompile}
          className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition"
        >
          <Sparkles className="w-4 h-4" />
          {isCompiling
            ? lang === "en"
              ? "Building Game..."
              : "गेम बन रहा है..."
            : lang === "en"
            ? "Build / Update Game"
            : "गेम बनाएँ / अपडेट करें"}
        </button>

        <button
          type="button"
          disabled={isCompiling}
          onClick={onRunDebugAgent}
          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
        >
          <Wand2 className="w-3.5 h-3.5" />
          {lang === "en" ? "Test & Fix Playability" : "खेलने की जाँच और सुधार"}
        </button>
      </div>

      {/* Agent Feedback Banner */}
      {agentBanner && (
        <div
          className={`p-2.5 rounded-xl border text-xs leading-relaxed ${
            agentBanner.tone === "fixed"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
              : agentBanner.tone === "ok"
              ? "bg-indigo-950/60 border-indigo-500/40 text-indigo-200"
              : "bg-amber-950/50 border-amber-500/40 text-amber-200"
          }`}
        >
          {lang === "en" ? agentBanner.en : agentBanner.hi}
        </div>
      )}

      {/* Active Rules List */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {lang === "en" ? `Active Rules (${rules.length})` : `सक्रिय नियम (${rules.length})`}
        </h3>
        {rules.length === 0 ? (
          <p className="text-[11px] text-slate-500">
            {lang === "en" ? "No rules yet." : "अभी कोई नियम नहीं है।"}
          </p>
        ) : (
          <div className="space-y-1.5">
            {rules.map((r) => (
              <div
                key={r.id}
                className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-[11px] ${
                  r.enabled
                    ? "bg-slate-950/80 border-slate-800 text-slate-200"
                    : "bg-slate-950/30 border-slate-900 text-slate-500 line-through"
                }`}
              >
                <span className="leading-snug flex-1">
                  {lang === "en" ? r.summaryEn : r.summaryHi}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleRule(r.id)}
                    className="p-1 text-slate-300 hover:text-white"
                    title={lang === "en" ? "Toggle rule" : "नियम चालू/बंद करें"}
                  >
                    {r.enabled ? (
                      <ToggleRight className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRule(r.id)}
                    className="p-1 text-slate-400 hover:text-rose-400"
                    title={lang === "en" ? "Delete rule" : "नियम हटाएँ"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
