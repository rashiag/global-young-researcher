import { NextRequest, NextResponse } from "next/server";
import { GameBlueprint, GameRule, PromptInputs } from "@/types/gameBlueprint";
import { validateBlueprint } from "@/lib/gameStudio/validator";

interface CompileRequestBody {
  blueprint?: GameBlueprint;
  prompts?: PromptInputs;
  lang?: "en" | "hi";
}

const SYSTEM_PROMPT = `You are an AI Game Program Editor for children (Grades 1-6) using bilingual English and Hindi prompts.
You receive:
1. currentBlueprint (GameBlueprint v1.0): entities, behaviors, world settings, and rules.
2. prompts: { gameIdea, movement, interactions, scoring, stopPoint }.

Available BehaviorType values for entities:
- "player_horizontal" (Left/Right arrow keys or touch D-pad)
- "player_4way" (Up/Down/Left/Right movement)
- "player_platformer" (Left/Right + Jump with gravity)
- "patrol_horizontal" (Auto-patrol left & right)
- "patrol_vertical" (Auto-patrol up & down)
- "spawn_and_fall" (Spawns at top & falls repeatedly)
- "float_random" (Gentle floating drift)
- "chase_target" (Continuously homes toward targetId; set behavior.targetId to the player entity id)
- "straight_line_to_target" (Locks a straight-line vector toward targetId at behavior.speed)
- "static" (Stationary)

Exact Rule JSON shape (ALWAYS populate non-empty rules[] matching the user's prompts and existing entity IDs):
{
  "id": "r_unique_id",
  "enabled": true,
  "summaryEn": "Short English summary",
  "summaryHi": "Short Hindi summary",
  "trigger": {
    "type": "on_collide" | "on_score_reach" | "on_lives_zero" | "on_timer_end",
    "sourceId": "<existing entity id for on_collide>",
    "targetId": "<existing entity id for on_collide>",
    "threshold": 50
  },
  "actions": [
    { "type": "add_score", "value": 10 },
    { "type": "lose_life", "value": 1 },
    { "type": "gain_life", "value": 1 },
    { "type": "destroy_target" },
    { "type": "respawn_source" },
    { "type": "bounce_source", "value": 10 },
    { "type": "play_sfx", "sfx": "pop" | "bonk" | "coin" | "jump" | "win" },
    { "type": "win_game", "sfx": "win" },
    { "type": "lose_game" }
  ]
}

Rules for editing:
- Always preserve existing entity IDs when updating existing sprites; keep coordinates within x: 40..760, y: 50..460, scale: 0.6..2.2.
- Never return an empty rules array when scoring, collisions, lives, or win/lose conditions are mentioned or present.
- Return ONLY a valid JSON object:
{
  "blueprint": { ...GameBlueprint v1.0 },
  "changesEn": "One clear sentence explaining what was updated in English",
  "changesHi": "हिंदी में एक स्पष्ट वाक्य जो बताए कि क्या बदला गया"
}`;

function synthesizeRulesIfEmpty(bp: GameBlueprint, prompts: PromptInputs): GameRule[] {
  if (bp.rules.length > 0 || bp.entities.length < 2) return bp.rules;

  const player =
    bp.entities.find((e) => e.behavior.type.startsWith("player_")) ??
    bp.entities.find((e) => /hero|bittu|tara|robo|player/i.test(`${e.name} ${e.spriteKey}`)) ??
    bp.entities[0];

  const hazard =
    bp.entities.find(
      (e) =>
        e.id !== player.id &&
        (/meteor|crow|bomb|spike|enemy|hazard/i.test(`${e.name} ${e.spriteKey}`) ||
          e.behavior.type === "chase_target" ||
          e.behavior.type === "straight_line_to_target")
    ) ?? null;

  const collectible =
    bp.entities.find(
      (e) =>
        e.id !== player.id &&
        (!hazard || e.id !== hazard.id)
    ) ?? null;

  const plusMatch = prompts.scoring.match(/\+(\d+)|(\d+)\s*(?:points|score|अंक)/i);
  const rewardPts = plusMatch ? Number(plusMatch[1] || plusMatch[2]) : 10;

  const minusMatch = prompts.scoring.match(/-(\d+)|lose\s+(\d+)\s*(?:points|score|अंक)/i);
  const penaltyPts = minusMatch ? -Math.abs(Number(minusMatch[1] || minusMatch[2])) : -5;

  const winMatch = prompts.stopPoint.match(/(?:reach|reaches|score\s*(?:of|is)?|अंक)\s*(\d+)/i);
  const winScore = winMatch ? Number(winMatch[1]) : 50;

  const generated: GameRule[] = [];

  if (collectible) {
    generated.push({
      id: "r_collect_item",
      enabled: true,
      summaryEn: `${player.name} touches ${collectible.name} -> +${rewardPts} Score, pop sound, respawn`,
      summaryHi: `${player.name} ${collectible.name} को छूता है -> +${rewardPts} अंक, पॉप आवाज़`,
      trigger: { type: "on_collide", sourceId: player.id, targetId: collectible.id },
      actions: [
        { type: "add_score", value: rewardPts },
        { type: "play_sfx", sfx: "pop" },
        { type: "destroy_target" },
      ],
    });
  }

  if (hazard) {
    generated.push({
      id: "r_hazard_hit",
      enabled: true,
      summaryEn: `${player.name} touches ${hazard.name} -> -1 Life, ${penaltyPts} Score, bonk sound`,
      summaryHi: `${player.name} ${hazard.name} को छूता है -> -1 जीवन, ${penaltyPts} अंक, बोंक आवाज़`,
      trigger: { type: "on_collide", sourceId: player.id, targetId: hazard.id },
      actions: [
        { type: "lose_life", value: 1 },
        { type: "add_score", value: penaltyPts },
        { type: "play_sfx", sfx: "bonk" },
      ],
    });
  }

  generated.push({
    id: "r_win_score",
    enabled: true,
    summaryEn: `Score reaches ${winScore} -> You Win!`,
    summaryHi: `अंक ${winScore} हों -> आप जीत गए!`,
    trigger: { type: "on_score_reach", threshold: winScore },
    actions: [{ type: "win_game", sfx: "win" }],
  });

  generated.push({
    id: "r_lose_lives",
    enabled: true,
    summaryEn: "Lives reach 0 -> Game Over",
    summaryHi: "जीवन 0 हों -> खेल समाप्त",
    trigger: { type: "on_lives_zero" },
    actions: [{ type: "lose_game" }],
  });

  return generated;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CompileRequestBody;
    if (!body?.blueprint || !body?.prompts) {
      return NextResponse.json(
        { error: "Missing blueprint or prompts" },
        { status: 400 }
      );
    }

    const current = validateBlueprint(body.blueprint, body.blueprint);
    const groqKey = process.env.GROQ_API_KEY?.trim();

    if (!groqKey) {
      return NextResponse.json({
        blueprint: current,
        source: "fallback",
        changesEn: "GROQ_API_KEY missing — used local compiler.",
        changesHi: "GROQ_API_KEY उपलब्ध नहीं है — लोकल कंपाइलर चला।",
      });
    }

    const userPayload = JSON.stringify({
      currentBlueprint: current,
      prompts: body.prompts,
      preferredLanguage: body.lang ?? "en",
    });

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        temperature: 0.15,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPayload },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return NextResponse.json({
        blueprint: current,
        source: "fallback",
        changesEn: `Groq API HTTP ${groqRes.status} — used local compiler. (${errText.slice(0, 90)})`,
        changesHi: `Groq API त्रुटि ${groqRes.status} — लोकल कंपाइलर चला।`,
      });
    }

    const groqData = (await groqRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const rawText = groqData.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(rawText) as {
      blueprint?: unknown;
      changesEn?: string;
      changesHi?: string;
    };

    const validated = validateBlueprint(parsed.blueprint ?? parsed, current);
    const finalBlueprint: GameBlueprint = {
      ...validated,
      rules:
        validated.rules.length > 0
          ? validated.rules
          : synthesizeRulesIfEmpty(validated, body.prompts),
    };

    return NextResponse.json({
      blueprint: finalBlueprint,
      source: "groq",
      changesEn:
        typeof parsed.changesEn === "string" && parsed.changesEn.trim()
          ? parsed.changesEn.trim()
          : "Groq AI updated your game rules and behaviors!",
      changesHi:
        typeof parsed.changesHi === "string" && parsed.changesHi.trim()
          ? parsed.changesHi.trim()
          : "Groq AI ने आपके गेम के नियम और चाल अपडेट कर दिए!",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown compile error";
    return NextResponse.json({
      blueprint: null,
      source: "fallback",
      changesEn: `Compile error: ${msg}`,
      changesHi: `कंपाइल त्रुटि: ${msg}`,
    });
  }
}