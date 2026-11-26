"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  FlipHorizontal,
  Copy,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { GameBlueprint, GameEntity } from "@/types/gameBlueprint";
import { CanvasRenderer } from "@/lib/gameStudio/CanvasRenderer";
import { GameRuntime, InputState } from "@/lib/gameStudio/GameRuntime";
import { getSpriteByKey, SpriteAsset } from "@/lib/gameStudio/assetRegistry";

interface StageCanvasProps {
  lang: "en" | "hi";
  mode: "edit" | "play";
  playSessionKey: number;
  blueprint: GameBlueprint;
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
  onUpdateEntity: (id: string, patch: Partial<GameEntity>) => void;
  onDuplicateEntity: (id: string) => void;
  onDeleteEntity: (id: string) => void;
  onDropSpriteAsset: (asset: SpriteAsset, x: number, y: number) => void;
  onRestartPlay: () => void;
}

export default function StageCanvas({
  lang,
  mode,
  playSessionKey,
  blueprint,
  selectedEntityId,
  onSelectEntity,
  onUpdateEntity,
  onDuplicateEntity,
  onDeleteEntity,
  onDropSpriteAsset,
  onRestartPlay,
}: StageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const runtimeRef = useRef<GameRuntime | null>(null);
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    up: false,
    down: false,
    jumpPressed: false,
  });

  const [dragAction, setDragAction] = useState<{
    kind: "move" | "resize";
    entityId: string;
    startScale: number;
    startDist: number;
  } | null>(null);

  useEffect(() => {
    if (rendererRef.current === null) {
      rendererRef.current = new CanvasRenderer();
    }
    if (runtimeRef.current === null) {
      runtimeRef.current = new GameRuntime(blueprint);
    }
  }, [blueprint]);

  const latestBlueprintRef = useRef<GameBlueprint>(blueprint);
  const lastCompiledSigRef = useRef<string>("");

  useEffect(() => {
    latestBlueprintRef.current = blueprint;
  }, [blueprint]);

  // Reset runtime when entering Play Mode, restarting, or when blueprint rules/entities change
  useEffect(() => {
    if (mode !== "play" || !runtimeRef.current) return;
    const sig = JSON.stringify({
      session: playSessionKey,
      title: blueprint.title,
      world: blueprint.world,
      entities: blueprint.entities.map((e) => ({
        id: e.id,
        spriteKey: e.spriteKey,
        x: e.x,
        y: e.y,
        scale: e.scale,
        behavior: e.behavior,
      })),
      rules: blueprint.rules,
    });
    if (sig !== lastCompiledSigRef.current) {
      lastCompiledSigRef.current = sig;
      runtimeRef.current.reset(latestBlueprintRef.current);
    }
  }, [mode, playSessionKey, blueprint]);

  // Keyboard listeners for Play Mode
  useEffect(() => {
    if (mode !== "play") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") inputRef.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") inputRef.current.right = true;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") inputRef.current.up = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") inputRef.current.down = true;
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        inputRef.current.jumpPressed = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") inputRef.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") inputRef.current.right = false;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") inputRef.current.up = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") inputRef.current.down = false;
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        inputRef.current.jumpPressed = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [mode]);

  // Main requestAnimationFrame loop (Edit preview or Play simulation)
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const frame = (now: number) => {
      const dtSec = (now - lastTime) / 1000;
      lastTime = now;

      const canvas = canvasRef.current;
      const renderer = rendererRef.current;
      const runtime = runtimeRef.current;
      if (canvas && renderer && runtime) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const targetW = CanvasRenderer.STAGE_WIDTH * dpr;
        const targetH = CanvasRenderer.STAGE_HEIGHT * dpr;
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
        const ctx = canvas.getContext("2d");
        if (ctx) {
          if (mode === "play") {
            runtime.step(dtSec, inputRef.current, true);
            inputRef.current.jumpPressed = false;
            runtime.render(ctx, dpr, renderer);
          } else {
            renderer.render(ctx, dpr, blueprint, {
              mode: "edit",
              selectedEntityId,
              score: blueprint.world.initialScore,
              lives: blueprint.world.initialLives,
              timeLeft: blueprint.world.timerSeconds,
              status: "running",
              visualStates: new Map(),
              particles: [],
              pops: [],
              nowSec: now / 1000,
            });
          }
        }
      }
      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [mode, blueprint, selectedEntityId]);

  const toStageCoords = (clientX: number, clientY: number): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 400, y: 250 };
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * CanvasRenderer.STAGE_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * CanvasRenderer.STAGE_HEIGHT;
    return {
      x: Math.max(36, Math.min(CanvasRenderer.STAGE_WIDTH - 36, x)),
      y: Math.max(48, Math.min(CanvasRenderer.STAGE_HEIGHT - 36, y)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== "edit") return;
    const pt = toStageCoords(e.clientX, e.clientY);

    // Check if clicking resize handle of currently selected entity
    if (selectedEntityId) {
      const sel = blueprint.entities.find((item) => item.id === selectedEntityId);
      if (sel) {
        const asset = getSpriteByKey(sel.spriteKey);
        const half = (asset.defaultSize * sel.scale) / 2 + 8;
        const hx = sel.x + half;
        const hy = sel.y + half;
        if (Math.hypot(pt.x - hx, pt.y - hy) <= 16) {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragAction({
            kind: "resize",
            entityId: sel.id,
            startScale: sel.scale,
            startDist: Math.max(20, Math.hypot(pt.x - sel.x, pt.y - sel.y)),
          });
          return;
        }
      }
    }

    // Hit-test entities in reverse draw order (top-most first)
    for (let i = blueprint.entities.length - 1; i >= 0; i--) {
      const ent = blueprint.entities[i];
      const asset = getSpriteByKey(ent.spriteKey);
      const radius = (asset.defaultSize * ent.scale) * 0.52;
      if (Math.hypot(pt.x - ent.x, pt.y - ent.y) <= radius) {
        e.currentTarget.setPointerCapture(e.pointerId);
        onSelectEntity(ent.id);
        setDragAction({
          kind: "move",
          entityId: ent.id,
          startScale: ent.scale,
          startDist: 0,
        });
        return;
      }
    }

    onSelectEntity(null);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragAction || mode !== "edit") return;
    const pt = toStageCoords(e.clientX, e.clientY);
    const ent = blueprint.entities.find((item) => item.id === dragAction.entityId);
    if (!ent) return;

    if (dragAction.kind === "move") {
      onUpdateEntity(ent.id, { x: Math.round(pt.x), y: Math.round(pt.y) });
    } else if (dragAction.kind === "resize") {
      const dist = Math.max(20, Math.hypot(pt.x - ent.x, pt.y - ent.y));
      const nextScale = Math.max(0.5, Math.min(2.5, Number(((dist / dragAction.startDist) * dragAction.startScale).toFixed(2))));
      onUpdateEntity(ent.id, { scale: nextScale });
    }
  };

  const handlePointerUp = () => {
    setDragAction(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (mode !== "edit") return;
    const rawKey = e.dataTransfer.getData("text/sprite-key");
    if (!rawKey) return;
    const asset = getSpriteByKey(rawKey);
    const pt = toStageCoords(e.clientX, e.clientY);
    onDropSpriteAsset(asset, Math.round(pt.x), Math.round(pt.y));
  };

  const selectedEntity = blueprint.entities.find((e) => e.id === selectedEntityId) ?? null;

  return (
    <section className="flex flex-col items-center justify-center gap-3 w-full h-full">
      {/* Selected Entity Quick Action Bar (Edit Mode) */}
      {mode === "edit" && selectedEntity && (
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/95 border border-slate-700 px-3 py-1.5 rounded-full shadow-lg text-xs">
          <span className="font-bold text-indigo-300">@{selectedEntity.name}</span>
          <input
            type="text"
            value={selectedEntity.name}
            maxLength={20}
            onChange={(e) => onUpdateEntity(selectedEntity.id, { name: e.target.value })}
            aria-label="Sprite Name"
            className="w-24 bg-slate-950 border border-slate-700 rounded-md px-2 py-0.5 text-white text-xs focus:outline-none focus:border-indigo-400"
          />
          <label className="flex items-center gap-1 text-slate-300">
            <span>{lang === "en" ? "Motion:" : "चाल:"}</span>
            <select
              value={selectedEntity.behavior.type}
              onChange={(e) =>
                onUpdateEntity(selectedEntity.id, {
                  behavior: {
                    ...selectedEntity.behavior,
                    type: e.target.value as GameEntity["behavior"]["type"],
                    targetId:
                      selectedEntity.behavior.targetId ??
                      blueprint.entities.find((item) => item.behavior.type.startsWith("player_"))?.id,
                  },
                })
              }
              aria-label="Motion Direction"
              className="bg-slate-950 border border-slate-700 rounded-md px-1.5 py-0.5 text-white text-xs"
            >
              <option value="player_horizontal">Left/Right Key</option>
              <option value="player_4way">4-Way Key</option>
              <option value="player_platformer">Jump + Gravity</option>
              <option value="patrol_horizontal">Patrol Left/Right</option>
              <option value="patrol_vertical">Patrol Up/Down</option>
              <option value="spawn_and_fall">Fall From Top</option>
              <option value="straight_line_to_target">Straight Line to Hero</option>
              <option value="chase_target">Chase Hero</option>
              <option value="float_random">Float</option>
              <option value="static">Still</option>
            </select>
          </label>
          <label className="flex items-center gap-1 text-slate-300">
            <span>{lang === "en" ? "Speed:" : "गति:"}</span>
            <input
              type="number"
              min={0}
              max={15}
              step={0.5}
              value={selectedEntity.behavior.speed}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (Number.isFinite(val)) {
                  onUpdateEntity(selectedEntity.id, {
                    behavior: { ...selectedEntity.behavior, speed: Math.max(0, Math.min(15, val)) },
                  });
                }
              }}
              aria-label="Sprite Speed"
              className="w-14 bg-slate-950 border border-slate-700 rounded-md px-1.5 py-0.5 text-white text-xs"
            />
          </label>
          <button
            type="button"
            onClick={() => onUpdateEntity(selectedEntity.id, { flipX: !selectedEntity.flipX })}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
            title={lang === "en" ? "Flip Left/Right" : "उल्टा करें"}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicateEntity(selectedEntity.id)}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
            title={lang === "en" ? "Duplicate" : "कॉपी करें"}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteEntity(selectedEntity.id)}
            className="p-1.5 rounded-md bg-rose-950 hover:bg-rose-900 text-rose-300"
            title={lang === "en" ? "Remove" : "हटाएँ"}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* High-DPI 800x500 Stage */}
      <div className="w-full max-w-[820px] aspect-[8/5] rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-slate-950 relative">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`w-full h-full block touch-none ${
            mode === "edit" ? "cursor-grab active:cursor-grabbing" : "cursor-default"
          }`}
        />
      </div>

      {/* Play Mode Touch / Keyboard Helper Bar */}
      {mode === "play" && (
        <div className="flex flex-wrap items-center justify-between gap-4 w-full max-w-[820px] bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-2xl">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onPointerDown={() => (inputRef.current.left = true)}
              onPointerUp={() => (inputRef.current.left = false)}
              onPointerLeave={() => (inputRef.current.left = false)}
              className="w-11 h-11 rounded-xl bg-slate-800 active:bg-indigo-600 flex items-center justify-center text-white"
              aria-label="Move Left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onPointerDown={() => {
                  inputRef.current.up = true;
                  inputRef.current.jumpPressed = true;
                }}
                onPointerUp={() => {
                  inputRef.current.up = false;
                  inputRef.current.jumpPressed = false;
                }}
                onPointerLeave={() => {
                  inputRef.current.up = false;
                  inputRef.current.jumpPressed = false;
                }}
                className="w-11 h-8 rounded-lg bg-slate-800 active:bg-indigo-600 flex items-center justify-center text-white"
                aria-label="Move Up / Jump"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onPointerDown={() => (inputRef.current.down = true)}
                onPointerUp={() => (inputRef.current.down = false)}
                onPointerLeave={() => (inputRef.current.down = false)}
                className="w-11 h-8 rounded-lg bg-slate-800 active:bg-indigo-600 flex items-center justify-center text-white"
                aria-label="Move Down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onPointerDown={() => (inputRef.current.right = true)}
              onPointerUp={() => (inputRef.current.right = false)}
              onPointerLeave={() => (inputRef.current.right = false)}
              className="w-11 h-11 rounded-xl bg-slate-800 active:bg-indigo-600 flex items-center justify-center text-white"
              aria-label="Move Right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="text-xs text-slate-400 text-center hidden sm:block">
            {lang === "en"
              ? "Arrow Keys / WASD to move · Space / Up to jump"
              : "चलने के लिए Arrow / WASD · कूदने के लिए Space / Up"}
          </div>

          <button
            type="button"
            onClick={onRestartPlay}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-4 h-4" />
            {lang === "en" ? "Restart" : "फिर शुरू करें"}
          </button>
        </div>
      )}
    </section>
  );
}
