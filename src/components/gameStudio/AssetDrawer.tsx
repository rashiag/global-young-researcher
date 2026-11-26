"use client";

import React, { useState } from "react";
import { Sparkles, Users, Gift, AlertTriangle, LayoutGrid } from "lucide-react";
import {
  AssetCategory,
  BACKDROP_ASSETS,
  HUD_ASSETS,
  SPRITE_ASSETS,
  SpriteAsset,
} from "@/lib/gameStudio/assetRegistry";

interface AssetDrawerProps {
  lang: "en" | "hi";
  activeBackdropKey: string;
  onSelectBackdrop: (key: string) => void;
  onAddSprite: (asset: SpriteAsset) => void;
  onToggleHud: (hudKey: "score_box" | "lives_box" | "timer_box") => void;
}

export default function AssetDrawer({
  lang,
  activeBackdropKey,
  onSelectBackdrop,
  onAddSprite,
  onToggleHud,
}: AssetDrawerProps) {
  const [tab, setTab] = useState<AssetCategory>("characters");

  const tabs: Array<{
    id: AssetCategory;
    labelEn: string;
    labelHi: string;
    icon: React.ReactNode;
  }> = [
    { id: "characters", labelEn: "Heroes", labelHi: "पात्र", icon: <Users className="w-4 h-4" /> },
    { id: "collectibles", labelEn: "Items", labelHi: "चीज़ें", icon: <Gift className="w-4 h-4" /> },
    { id: "hazards", labelEn: "Traps", labelHi: "चुनौती", icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "backdrops", labelEn: "Worlds", labelHi: "दुनिया", icon: <Sparkles className="w-4 h-4" /> },
    { id: "hud", labelEn: "Score/UI", labelHi: "स्कोर/UI", icon: <LayoutGrid className="w-4 h-4" /> },
  ];

  const filteredSprites = SPRITE_ASSETS.filter((s) => s.category === tab);

  return (
    <aside className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col gap-3 h-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {lang === "en" ? "Game Elements" : "गेम के तत्व"}
        </h2>
        <span className="text-[11px] text-slate-400">
          {lang === "en" ? "Click or Drag" : "क्लिक या खींचें"}
        </span>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-semibold transition ${
                active
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title={lang === "en" ? t.labelEn : t.labelHi}
            >
              {t.icon}
              <span className="mt-0.5 truncate max-w-full">
                {lang === "en" ? t.labelEn : t.labelHi}
              </span>
            </button>
          );
        })}
      </div>

      {/* Asset Grid */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-2">
        {tab === "backdrops" && (
          <div className="grid grid-cols-1 gap-2">
            {BACKDROP_ASSETS.map((bg) => {
              const selected = activeBackdropKey === bg.key;
              return (
                <button
                  key={bg.key}
                  type="button"
                  onClick={() => onSelectBackdrop(bg.key)}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center gap-3 ${
                    selected
                      ? "border-indigo-400 bg-indigo-950/50"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <div
                    className="w-12 h-9 rounded-lg shrink-0 border border-white/15"
                    style={{
                      background: `linear-gradient(180deg, ${bg.skyTop} 0%, ${bg.skyBottom} 72%, ${bg.groundColor} 72%, ${bg.groundColor} 100%)`,
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {lang === "en" ? bg.nameEn : bg.nameHi}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {lang === "en" ? bg.nameHi : bg.nameEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {tab === "hud" && (
          <div className="grid grid-cols-1 gap-2">
            {HUD_ASSETS.map((hud) => (
              <button
                key={hud.key}
                type="button"
                onClick={() => onToggleHud(hud.key)}
                className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-indigo-500/60 transition flex items-center gap-3"
              >
                <span className="text-xl">{hud.emojiFallback}</span>
                <div>
                  <p className="text-xs font-semibold text-white">
                    {lang === "en" ? hud.nameEn : hud.nameHi}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {lang === "en" ? "Toggle on stage" : "स्टेज पर दिखाएँ/छुपाएँ"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab !== "backdrops" && tab !== "hud" && (
          <div className="grid grid-cols-2 gap-2">
            {filteredSprites.map((sp) => (
              <button
                key={sp.key}
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/sprite-key", sp.key);
                }}
                onClick={() => onAddSprite(sp)}
                className="group p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-indigo-400 hover:bg-indigo-950/30 transition flex flex-col items-center text-center gap-1.5"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition"
                  style={{ backgroundColor: `${sp.tintColor}33`, border: `1.5px solid ${sp.tintColor}88` }}
                >
                  {sp.emojiFallback}
                </div>
                <span className="text-xs font-semibold text-slate-100 leading-tight">
                  {lang === "en" ? sp.nameEn : sp.nameHi}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
