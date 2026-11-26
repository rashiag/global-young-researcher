"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Play,
  Pencil,
  Volume2,
  VolumeX,
  Share2,
  Download,
  Copy,
  Check,
  X,
} from "lucide-react";
import {
  GameBlueprint,
  GameEntity,
  GameRule,
  PromptInputs,
} from "@/types/gameBlueprint";
import { STARTER_TEMPLATES } from "@/lib/gameStudio/starterTemplates";
import { SpriteAsset } from "@/lib/gameStudio/assetRegistry";
import { soundSynth } from "@/lib/gameStudio/SoundSynth";
import { runPlaytestAgent, validateBlueprint } from "@/lib/gameStudio/validator";
import AssetDrawer from "./AssetDrawer";
import StageCanvas from "./StageCanvas";
import PromptStudio from "./PromptStudio";

function compilePromptsLocally(
  current: GameBlueprint,
  prompts: PromptInputs
): { blueprint: GameBlueprint; changesEn: string; changesHi: string } {
  const notesEn: string[] = [];
  const notesHi: string[] = [];
  const next: GameBlueprint = {
    ...current,
    world: { ...current.world },
    entities: current.entities.map((e) => ({ ...e, behavior: { ...e.behavior } })),
    rules: [...current.rules],
  };

  if (next.entities.length === 0) {
    next.entities.push(
      {
        id: "hero_auto_1",
        name: "Bittu",
        spriteKey: "bittu",
        x: 400,
        y: 410,
        scale: 1.15,
        flipX: false,
        logicPrompt: "Move left and right with arrow keys",
        behavior: { type: "player_horizontal", speed: 6 },
      },
      {
        id: "item_auto_2",
        name: "Mango",
        spriteKey: "mango",
        x: 340,
        y: 90,
        scale: 1,
        flipX: false,
        logicPrompt: "Fall down from top and respawn",
        behavior: { type: "spawn_and_fall", speed: 3.5, spawnIntervalSec: 1.5 },
      }
    );
  }

  const perSpriteCombined = next.entities
    .map((e) => (e.logicPrompt ? `${e.name}: ${e.logicPrompt}` : ""))
    .filter(Boolean)
    .join(" ");

  const movLower = `${perSpriteCombined} ${prompts.movement}`.toLowerCase();
  const intLower = `${perSpriteCombined} ${prompts.interactions}`.toLowerCase();
  const scoreLower = prompts.scoring.toLowerCase();
  const stopLower = prompts.stopPoint.toLowerCase();

  const player =
    next.entities.find((e) => e.behavior.type.startsWith("player_")) ?? next.entities[0];

  for (const ent of next.entities) {
    const cleanName = ent.name.replace(/^@/, "").toLowerCase();
    const ownPrompt = (ent.logicPrompt ?? "").toLowerCase();
    const combinedEntText = `${ownPrompt} ${movLower} ${intLower}`;
    const mentioned =
      ownPrompt.trim().length > 0 ||
      (cleanName.length > 0 && (movLower.includes(cleanName) || intLower.includes(cleanName))) ||
      movLower.includes(ent.spriteKey.toLowerCase()) ||
      intLower.includes(ent.spriteKey.toLowerCase());

    const speedMatch = combinedEntText.match(/speed\s*(\d+(?:\.\d+)?)/i);
    const parsedSpeed = speedMatch ? Number(speedMatch[1]) : null;

    if (ent.id === player?.id) {
      const pText = `${ownPrompt} ${movLower}`;
      if (pText.includes("jump") || pText.includes("कूद") || pText.includes("platform")) {
        ent.behavior.type = "player_platformer";
        ent.behavior.jumpForce = ent.behavior.jumpForce || 12.5;
        next.world.gravity = next.world.gravity || 0.45;
      } else if (
        pText.includes("4-way") ||
        pText.includes("up and down") ||
        pText.includes("हर दिशा") ||
        pText.includes("चारों दिशा")
      ) {
        ent.behavior.type = "player_4way";
      } else {
        ent.behavior.type = "player_horizontal";
      }
      if (parsedSpeed !== null) ent.behavior.speed = parsedSpeed;
      continue;
    }

    if (mentioned) {
      const eText = ownPrompt.trim().length > 0 ? ownPrompt : combinedEntText;
      if (eText.includes("fall") || eText.includes("गिर") || eText.includes("drop")) {
        ent.behavior.type = "spawn_and_fall";
        ent.behavior.speed = parsedSpeed ?? (ent.behavior.speed || 3.5);
      } else if (
        eText.includes("straight line") ||
        eText.includes("towards") ||
        eText.includes("toward") ||
        eText.includes("सीधी रेखा")
      ) {
        ent.behavior.type = "straight_line_to_target";
        ent.behavior.targetId = player?.id;
        ent.behavior.speed = parsedSpeed ?? 2;
        notesEn.push(
          `${ent.name} flies in a straight line toward ${player?.name ?? "player"} at speed ${ent.behavior.speed} and respawns at boundaries.`
        );
        notesHi.push(
          `${ent.name} ${player?.name ?? "खिलाड़ी"} की ओर सीधी रेखा में गति ${ent.behavior.speed} से उड़ेगा और सीमा पर फिर आएगा।`
        );
      } else if (eText.includes("chase") || eText.includes("पीछा")) {
        ent.behavior.type = "chase_target";
        ent.behavior.targetId = player?.id;
        ent.behavior.speed = parsedSpeed ?? (ent.behavior.speed || 3);
      } else if (
        eText.includes("patrol") ||
        eText.includes("fly") ||
        eText.includes("उड़") ||
        eText.includes("move")
      ) {
        ent.behavior.type = "patrol_horizontal";
        ent.behavior.speed = parsedSpeed ?? (ent.behavior.speed || 4);
      }
    }
  }

  const skipScoreUpdate = scoreLower.includes("no change") || scoreLower.trim() === "";
  if (!skipScoreUpdate) {
    const plusMatch = prompts.scoring.match(/\+(\d+)|(\d+)\s*(?:points|score|अंक)/i);
    if (plusMatch) {
      const scoreDelta = Number(plusMatch[1] || plusMatch[2]);
      next.rules = next.rules.map((r) =>
        r.trigger.type === "on_collide" && r.actions.some((a) => a.type === "add_score")
          ? {
              ...r,
              summaryEn: r.summaryEn.replace(/\+\d+/, `+${scoreDelta}`),
              summaryHi: r.summaryHi.replace(/\+\d+/, `+${scoreDelta}`),
              actions: r.actions.map((a) =>
                a.type === "add_score" ? { ...a, value: scoreDelta } : a
              ),
            }
          : r
      );
      notesEn.push(`Score reward set to +${scoreDelta}.`);
      notesHi.push(`अंक इनाम +${scoreDelta} सेट किया गया।`);
    }
  }

  const skipWinUpdate = stopLower.includes("no change") || stopLower.trim() === "";
  if (!skipWinUpdate) {
    const winMatch = prompts.stopPoint.match(/(\d+)/);
    if (winMatch) {
      const winThreshold = Number(winMatch[1]);
      next.rules = next.rules.map((r) =>
        r.trigger.type === "on_score_reach"
          ? {
              ...r,
              summaryEn: `Score reaches ${winThreshold} -> You Win!`,
              summaryHi: `अंक ${winThreshold} हों -> आप जीत गए!`,
              trigger: { ...r.trigger, threshold: winThreshold },
            }
          : r
      );
      notesEn.push(`Win target set to ${winThreshold} points.`);
      notesHi.push(`जीत का लक्ष्य ${winThreshold} अंक सेट किया गया।`);
    }
  }

  const others = next.entities.filter((e) => e.id !== player?.id);
  const collectible =
    others.find((e) => ["mango", "star", "laddoo", "gem", "coin"].includes(e.spriteKey)) ??
    others[0] ??
    null;
  const hazard =
    others.find(
      (e) =>
        e.id !== collectible?.id &&
        ["crow", "meteor", "cactus", "slime"].includes(e.spriteKey)
    ) ?? null;

  if (next.rules.length === 0 && player && collectible) {
    const updatedRules: GameRule[] = [
      {
        id: `rule_collect_${Date.now()}`,
        enabled: true,
        summaryEn: `${player.name} touches ${collectible.name} -> +10 Score, pop sound`,
        summaryHi: `${player.name} ${collectible.name} को छूता है -> +10 अंक, पॉप आवाज़`,
        trigger: { type: "on_collide", sourceId: player.id, targetId: collectible.id },
        actions: [
          { type: "add_score", value: 10 },
          { type: "play_sfx", sfx: "pop" },
          { type: "destroy_target" as const },
        ],
      },
    ];
    if (hazard) {
      updatedRules.push({
        id: `rule_hazard_${Date.now() + 1}`,
        enabled: true,
        summaryEn: `${player.name} touches ${hazard.name} -> -1 Life, bonk sound`,
        summaryHi: `${player.name} ${hazard.name} को छूता है -> -1 जीवन, बोंक आवाज़`,
        trigger: { type: "on_collide", sourceId: player.id, targetId: hazard.id },
        actions: [
          { type: "lose_life", value: 1 },
          { type: "play_sfx", sfx: "bonk" },
        ],
      });
    }
    next.rules = updatedRules;
  }

  const validated = validateBlueprint(next, current);
  return {
    blueprint: validated,
    changesEn:
      notesEn.length > 0
        ? notesEn.join(" ")
        : "Updated game blueprint. Switch to Play to test!",
    changesHi:
      notesHi.length > 0
        ? notesHi.join(" ")
        : "गेम ब्लूप्रिंट अपडेट हो गया। खेलने के लिए Play दबाएँ!",
  };
}

export default function GameStudioShell() {
  const initialTemplate = STARTER_TEMPLATES[0];

  const [lang, setLang] = useState<"en" | "hi">("en");
  const [mode, setMode] = useState<"edit" | "play">("edit");
  const [playSessionKey, setPlaySessionKey] = useState(0);
  const [muted, setMuted] = useState(false);

  const [blueprint, setBlueprint] = useState<GameBlueprint>(initialTemplate.blueprint);
  const [prompts, setPrompts] = useState<PromptInputs>({
    ...initialTemplate.prompts,
  });
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(
    initialTemplate.blueprint.entities[0]?.id ?? null
  );
  const [isCompiling, setIsCompiling] = useState(false);
  const [agentBanner, setAgentBanner] = useState<{
    en: string;
    hi: string;
    tone: "info" | "fixed" | "ok";
  } | null>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const handleTemplateChange = (templateId: string) => {
    const found = STARTER_TEMPLATES.find((t) => t.id === templateId);
    if (!found) return;
    const cloned = JSON.parse(JSON.stringify(found.blueprint)) as GameBlueprint;
    setBlueprint(cloned);
    setPrompts({ ...found.prompts });
    setSelectedEntityId(cloned.entities[0]?.id ?? null);
    setMode("edit");
    setAgentBanner(null);
  };

  const handleMuteToggle = () => {
    const nextMuted = !muted;
    soundSynth.muted = nextMuted;
    setMuted(nextMuted);
  };

  const handleSelectBackdrop = (backdropKey: string) => {
    setBlueprint((prev) => ({
      ...prev,
      world: { ...prev.world, backdropKey },
    }));
  };

  const handleToggleHud = (hudKey: "score_box" | "lives_box" | "timer_box") => {
    setBlueprint((prev) => {
      if (hudKey === "score_box") {
        return { ...prev, world: { ...prev.world, showScoreHud: !prev.world.showScoreHud } };
      }
      if (hudKey === "lives_box") {
        return { ...prev, world: { ...prev.world, showLivesHud: !prev.world.showLivesHud } };
      }
      const nextTimer = prev.world.timerSeconds === null ? 30 : null;
      return { ...prev, world: { ...prev.world, timerSeconds: nextTimer } };
    });
  };

  const createEntityFromAsset = (asset: SpriteAsset, x: number, y: number): GameEntity => {
    const count = blueprint.entities.length + 1;
    const defaultBehavior =
      asset.category === "characters"
        ? { type: "player_horizontal" as const, speed: 6 }
        : asset.category === "collectibles"
        ? { type: "spawn_and_fall" as const, speed: 3, spawnIntervalSec: 1.5 }
        : { type: "patrol_horizontal" as const, speed: 3.8 };

    return {
      id: `${asset.key}_${Date.now()}_${count}`,
      name: `${asset.nameEn}${count > 1 ? ` ${count}` : ""}`,
      spriteKey: asset.key,
      x,
      y,
      scale: 1,
      flipX: false,
      logicPrompt: "",
      behavior: defaultBehavior,
    };
  };

  const handleAddSprite = (asset: SpriteAsset) => {
    const idx = blueprint.entities.length;
    const x = 160 + ((idx * 140) % 480);
    const y = asset.category === "characters" ? 410 : 140 + ((idx * 75) % 210);
    const newEnt = createEntityFromAsset(asset, x, y);
    setBlueprint((prev) => ({ ...prev, entities: [...prev.entities, newEnt] }));
    setSelectedEntityId(newEnt.id);
  };

  const handleDropSpriteAsset = (asset: SpriteAsset, x: number, y: number) => {
    const newEnt = createEntityFromAsset(asset, x, y);
    setBlueprint((prev) => ({ ...prev, entities: [...prev.entities, newEnt] }));
    setSelectedEntityId(newEnt.id);
  };

  const handleUpdateEntity = (id: string, patch: Partial<GameEntity>) => {
    setBlueprint((prev) => ({
      ...prev,
      entities: prev.entities.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  };

  const handleUpdateEntityPrompt = (entityId: string, logicPrompt: string) => {
    setBlueprint((prev) => ({
      ...prev,
      entities: prev.entities.map((e) => (e.id === entityId ? { ...e, logicPrompt } : e)),
    }));
  };

  const handleDuplicateEntity = (id: string) => {
    const target = blueprint.entities.find((e) => e.id === id);
    if (!target) return;
    const copy: GameEntity = {
      ...target,
      id: `${target.spriteKey}_${Date.now()}`,
      name: `${target.name} 2`,
      x: Math.min(740, target.x + 45),
      y: Math.min(440, target.y + 25),
      behavior: { ...target.behavior },
    };
    setBlueprint((prev) => ({ ...prev, entities: [...prev.entities, copy] }));
    setSelectedEntityId(copy.id);
  };

  const handleDeleteEntity = (id: string) => {
    setBlueprint((prev) => ({
      ...prev,
      entities: prev.entities.filter((e) => e.id !== id),
      rules: prev.rules.filter(
        (r) => r.trigger.sourceId !== id && r.trigger.targetId !== id
      ),
    }));
    if (selectedEntityId === id) {
      setSelectedEntityId(null);
    }
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    setAgentBanner({
      en: "Compiling rules with AI...",
      hi: "AI से नियम अपडेट हो रहे हैं...",
      tone: "info",
    });

    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint, prompts, lang }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          blueprint?: GameBlueprint | null;
          source?: string;
          changesEn?: string;
          changesHi?: string;
        };

        if (data.blueprint && (data.source === "groq" || data.source === "gemini")) {
          const validated = validateBlueprint(data.blueprint, blueprint);
          if (!validated) return;
          setBlueprint(validated);
          setPlaySessionKey((k) => k + 1);
          setAgentBanner({
            en: `[${data.source.toUpperCase()}] ${data.changesEn ?? "Updated game!"}`,
            hi: `[${data.source.toUpperCase()}] ${data.changesHi ?? "गेम अपडेट हुआ!"}`,
            tone: "fixed",
          });
          setIsCompiling(false);
          return;
        }

        const compiled = compilePromptsLocally(blueprint, prompts);
        setBlueprint((prev) => validateBlueprint(compiled.blueprint, prev));
        setPlaySessionKey((k) => k + 1);
        const detailEn = data.changesEn ? ` (${data.changesEn})` : "";
        const detailHi = data.changesHi ? ` (${data.changesHi})` : "";
        setAgentBanner({
          en: `${compiled.changesEn}${detailEn}`,
          hi: `${compiled.changesHi}${detailHi}`,
          tone: "ok",
        });
        setIsCompiling(false);
        return;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      const compiled = compilePromptsLocally(blueprint, prompts);
      setBlueprint((prev) => validateBlueprint(compiled.blueprint, prev));
      setPlaySessionKey((k) => k + 1);
      setAgentBanner({
        en: `${compiled.changesEn} (${msg})`,
        hi: `${compiled.changesHi} (${msg})`,
        tone: "info",
      });
      setIsCompiling(false);
      return;
    }

    const compiled = compilePromptsLocally(blueprint, prompts);
    setBlueprint((prev) => validateBlueprint(compiled.blueprint, prev));
    setPlaySessionKey((k) => k + 1);
    setAgentBanner({
      en: compiled.changesEn,
      hi: compiled.changesHi,
      tone: "ok",
    });
    setIsCompiling(false);
  };

  const handleRunDebugAgent = () => {
    const result = runPlaytestAgent(blueprint);
    setBlueprint(result.blueprint);
    if (result.fixesAppliedEn.length > 0) {
      setAgentBanner({
        en: `Playtest Agent fixed: ${result.fixesAppliedEn.join(" ")}`,
        hi: `प्लेटेस्ट एजेंट ने सुधारा: ${result.fixesAppliedHi.join(" ")}`,
        tone: "fixed",
      });
    } else if (result.issuesRemaining.length > 0) {
      setAgentBanner({
        en: result.issuesRemaining.join(" "),
        hi: "कृपया स्टेज पर एक पात्र और नियम जोड़ें।",
        tone: "info",
      });
    } else {
      setAgentBanner({
        en: "Playtest check passed! Player movement and scoring look playable.",
        hi: "प्लेटेस्ट जाँच सफल! गेम खेलने योग्य है।",
        tone: "ok",
      });
    }
  };

  const handleToggleRule = (ruleId: string) => {
    setBlueprint((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r)),
    }));
  };

  const handleDeleteRule = (ruleId: string) => {
    setBlueprint((prev) => ({
      ...prev,
      rules: prev.rules.filter((r) => r.id !== ruleId),
    }));
  };

  const handleCopyJson = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(JSON.stringify(blueprint, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1800);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${blueprint.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "my-game"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const encodedBlueprint =
    typeof window !== "undefined"
      ? encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(blueprint)))))
      : "";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800/90 bg-slate-900/80 backdrop-blur px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-xs shrink-0">
            खेल बनाओ AI Studio
          </div>
          <input
            type="text"
            value={blueprint?.title ?? ""}
            maxLength={50}
            onChange={(e) => setBlueprint((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
            aria-label="Game Title"
            className="bg-slate-950/90 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-semibold text-white w-44 sm:w-56 focus:outline-none focus:border-indigo-400"
          />
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) handleTemplateChange(e.target.value);
            }}
            aria-label="Starter Templates"
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-400"
          >
            <option value="">
              {lang === "en" ? "Load Starter..." : "स्टार्टर चुनें..."}
            </option>
            {STARTER_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {lang === "en" ? t.labelEn : t.labelHi}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                mode === "edit"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              {lang === "en" ? "Edit" : "बनाएँ"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaySessionKey((k) => k + 1);
                setMode("play");
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                mode === "play"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              {lang === "en" ? "Play" : "खेलें"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setLang((prev) => (prev === "en" ? "hi" : "en"))}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-300 transition"
          >
            {lang === "en" ? "हिन्दी" : "EN"}
          </button>

          <button
            type="button"
            onClick={handleMuteToggle}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
            aria-label="Toggle Sound"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            {lang === "en" ? "Share" : "शेयर"}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-3 lg:h-[calc(100vh-88px)]">
          <AssetDrawer
            lang={lang}
            activeBackdropKey={blueprint.world.backdropKey}
            onSelectBackdrop={handleSelectBackdrop}
            onAddSprite={handleAddSprite}
            onToggleHud={handleToggleHud}
          />
        </div>

        <div className="lg:col-span-6 flex items-center justify-center lg:h-[calc(100vh-88px)]">
          <StageCanvas
            lang={lang}
            mode={mode}
            playSessionKey={playSessionKey}
            blueprint={blueprint}
            selectedEntityId={selectedEntityId}
            onSelectEntity={setSelectedEntityId}
            onUpdateEntity={handleUpdateEntity}
            onDuplicateEntity={handleDuplicateEntity}
            onDeleteEntity={handleDeleteEntity}
            onDropSpriteAsset={handleDropSpriteAsset}
            onRestartPlay={() => setPlaySessionKey((k) => k + 1)}
          />
        </div>

        <div className="lg:col-span-3 lg:h-[calc(100vh-88px)]">
          <PromptStudio
            lang={lang}
            entities={blueprint.entities}
            rules={blueprint.rules}
            prompts={prompts}
            isCompiling={isCompiling}
            agentBanner={agentBanner}
            onChangePrompts={setPrompts}
            onUpdateEntityPrompt={handleUpdateEntityPrompt}
            onCompile={handleCompile}
            onRunDebugAgent={handleRunDebugAgent}
            onToggleRule={handleToggleRule}
            onDeleteRule={handleDeleteRule}
          />
        </div>
      </main>

      {shareOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {lang === "en" ? "Share & Export Blueprint" : "गेम ब्लूप्रिंट शेयर और डाउनलोड"}
              </h3>
              <button
                type="button"
                onClick={() => setShareOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === "en"
                ? "Open a standalone playable link or export your GameBlueprint JSON to save or remix."
                : "खेलने योग्य लिंक खोलें या अपना GameBlueprint JSON डाउनलोड करें।"}
            </p>

            <div className="flex flex-wrap gap-2">
              {encodedBlueprint && (
                <Link
                  href={`/play/custom?bp=${encodedBlueprint}`}
                  target="_blank"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  {lang === "en" ? "Open Play Link" : "प्ले लिंक खोलें"}
                </Link>
              )}
              <button
                type="button"
                onClick={handleCopyJson}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedJson
                  ? lang === "en"
                    ? "Copied JSON!"
                    : "JSON कॉपी हुआ!"
                  : lang === "en"
                  ? "Copy JSON"
                  : "JSON कॉपी करें"}
              </button>
              <button
                type="button"
                onClick={handleDownloadJson}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                {lang === "en" ? "Download .json" : ".json डाउनलोड"}
              </button>
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 max-h-56 overflow-auto font-mono">
              {JSON.stringify(blueprint, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
