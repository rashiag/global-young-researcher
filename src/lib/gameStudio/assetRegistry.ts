export type AssetCategory = "backdrops" | "characters" | "collectibles" | "hazards" | "hud";

export interface BackdropAsset {
  key: string;
  nameEn: string;
  nameHi: string;
  imagePath: string;
  skyTop: string;
  skyBottom: string;
  groundColor: string;
  accentColor: string;
}

export interface SpriteAsset {
  key: string;
  category: Exclude<AssetCategory, "backdrops" | "hud">;
  nameEn: string;
  nameHi: string;
  imagePath: string;
  emojiFallback: string;
  tintColor: string;
  defaultSize: number; // base pixel size on 800x500 canvas
}

export interface HudAsset {
  key: "score_box" | "lives_box" | "timer_box";
  nameEn: string;
  nameHi: string;
  emojiFallback: string;
}

export const BACKDROP_ASSETS: BackdropAsset[] = [
  {
    key: "orchard",
    nameEn: "Mango Orchard",
    nameHi: "आम का बगीचा",
    imagePath: "/game-studio/backdrops/orchard.webp",
    skyTop: "#7dd3fc",
    skyBottom: "#fef9c3",
    groundColor: "#4ade80",
    accentColor: "#f59e0b",
  },
  {
    key: "space",
    nameEn: "Outer Space",
    nameHi: "अंतरिक्ष",
    imagePath: "/game-studio/backdrops/space.webp",
    skyTop: "#090d16",
    skyBottom: "#1e1b4b",
    groundColor: "#312e81",
    accentColor: "#38bdf8",
  },
  {
    key: "jungle",
    nameEn: "Jungle Trail",
    nameHi: "जंगल का रास्ता",
    imagePath: "/game-studio/backdrops/jungle.webp",
    skyTop: "#34d399",
    skyBottom: "#ecfccb",
    groundColor: "#15803d",
    accentColor: "#a3e635",
  },
  {
    key: "ocean",
    nameEn: "Deep Ocean",
    nameHi: "गहरा सागर",
    imagePath: "/game-studio/backdrops/ocean.webp",
    skyTop: "#0284c7",
    skyBottom: "#0f172a",
    groundColor: "#0369a1",
    accentColor: "#2dd4bf",
  },
  {
    key: "bazaar",
    nameEn: "Indian Bazaar",
    nameHi: "रंगीन बाज़ार",
    imagePath: "/game-studio/backdrops/bazaar.webp",
    skyTop: "#fda4af",
    skyBottom: "#fef08a",
    groundColor: "#d97706",
    accentColor: "#e11d48",
  },
];

export const SPRITE_ASSETS: SpriteAsset[] = [
  { key: "bittu", category: "characters", nameEn: "Bittu", nameHi: "बिट्टू", imagePath: "/game-studio/sprites/bittu.webp", emojiFallback: "👦🏽", tintColor: "#4f46e5", defaultSize: 64 },
  { key: "tara", category: "characters", nameEn: "Tara", nameHi: "तारा", imagePath: "/game-studio/sprites/tara.webp", emojiFallback: "👧🏽", tintColor: "#ec4899", defaultSize: 64 },
  { key: "robot", category: "characters", nameEn: "Robo Buddy", nameHi: "रोबो साथी", imagePath: "/game-studio/sprites/robot.webp", emojiFallback: "🤖", tintColor: "#0ea5e9", defaultSize: 64 },
  { key: "dino", category: "characters", nameEn: "Mini Dino", nameHi: "नन्हा डायनासोर", imagePath: "/game-studio/sprites/dino.webp", emojiFallback: "🦕", tintColor: "#10b981", defaultSize: 68 },
  { key: "rabbit", category: "characters", nameEn: "Bunny", nameHi: "खरगोश", imagePath: "/game-studio/sprites/rabbit.webp", emojiFallback: "🐰", tintColor: "#f472b6", defaultSize: 60 },
  { key: "astronaut", category: "characters", nameEn: "Astro Kid", nameHi: "अंतरिक्ष यात्री", imagePath: "/game-studio/sprites/astronaut.webp", emojiFallback: "🧑🏽‍🚀", tintColor: "#6366f1", defaultSize: 66 },

  { key: "mango", category: "collectibles", nameEn: "Mango", nameHi: "आम", imagePath: "/game-studio/sprites/mango.webp", emojiFallback: "🥭", tintColor: "#f59e0b", defaultSize: 48 },
  { key: "star", category: "collectibles", nameEn: "Magic Star", nameHi: "जादुई तारा", imagePath: "/game-studio/sprites/star.webp", emojiFallback: "⭐", tintColor: "#eab308", defaultSize: 48 },
  { key: "laddoo", category: "collectibles", nameEn: "Laddoo", nameHi: "लड्डू", imagePath: "/game-studio/sprites/laddoo.webp", emojiFallback: "🟡", tintColor: "#f97316", defaultSize: 46 },
  { key: "gem", category: "collectibles", nameEn: "Crystal Gem", nameHi: "चमकता रत्न", imagePath: "/game-studio/sprites/gem.webp", emojiFallback: "💎", tintColor: "#06b6d4", defaultSize: 46 },
  { key: "coin", category: "collectibles", nameEn: "Gold Coin", nameHi: "सोने का सिक्का", imagePath: "/game-studio/sprites/coin.webp", emojiFallback: "🪙", tintColor: "#fbbf24", defaultSize: 44 },

  { key: "crow", category: "hazards", nameEn: "Grumpy Crow", nameHi: "नाराज़ कौआ", imagePath: "/game-studio/sprites/crow.webp", emojiFallback: "🐦‍⬛", tintColor: "#334155", defaultSize: 54 },
  { key: "meteor", category: "hazards", nameEn: "Space Meteor", nameHi: "उल्कापिंड", imagePath: "/game-studio/sprites/meteor.webp", emojiFallback: "☄️", tintColor: "#ef4444", defaultSize: 54 },
  { key: "cactus", category: "hazards", nameEn: "Spiky Cactus", nameHi: "काँटेदार कैक्टस", imagePath: "/game-studio/sprites/cactus.webp", emojiFallback: "🌵", tintColor: "#16a34a", defaultSize: 56 },
  { key: "slime", category: "hazards", nameEn: "Bouncy Slime", nameHi: "स्लाइम", imagePath: "/game-studio/sprites/slime.webp", emojiFallback: "👾", tintColor: "#8b5cf6", defaultSize: 52 },
];

export const HUD_ASSETS: HudAsset[] = [
  { key: "score_box", nameEn: "Score Counter", nameHi: "अंक काउंटर", emojiFallback: "🏆" },
  { key: "lives_box", nameEn: "Hearts / Lives", nameHi: "जीवन (दिल)", emojiFallback: "❤️" },
  { key: "timer_box", nameEn: "Timer Clock", nameHi: "समय घड़ी", emojiFallback: "⏱️" },
];

export function getBackdropByKey(key: string): BackdropAsset {
  return BACKDROP_ASSETS.find((b) => b.key === key) ?? BACKDROP_ASSETS[0];
}

export function getSpriteByKey(key: string): SpriteAsset {
  return SPRITE_ASSETS.find((s) => s.key === key) ?? SPRITE_ASSETS[0];
}
