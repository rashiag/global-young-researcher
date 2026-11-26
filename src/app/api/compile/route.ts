import { NextRequest, NextResponse } from "next/server";
import { GameBlueprint, PromptInputs } from "@/types/gameBlueprint";
import { validateBlueprint } from "@/lib/gameStudio/validator";

interface CompileRequestBody {
  blueprint?: GameBlueprint;
  prompts?: PromptInputs;
  lang?: "en" | "hi";
}

const SYSTEM_PROMPT = `You are an AI Game Program Editor for children (Grades 1-6) using bilingual English and Hindi prompts.
You receive:
1. currentBlueprint (GameBlueprint v1.0): entities, behaviors, world settings, and rules.
2. prompts: { movement, interactions, scoring, stopPoint }.

Available BehaviorType values for entities:
- "player_horizontal" (Left/Right arrow keys or touch D-pad)
- "player_4way" (Up/Down/Left/Right movement)
- "player_platformer" (Left/Right + Jump with gravity)
- "patrol_horizontal" (Auto-patrol left & right)
- "patrol_vertical" (Auto-patrol up & down)
- "spawn_and_fall" (Spawns at top & falls repeatedly)
- "float_random" (Gentle floating drift)
- "chase_target" (Continuously homes toward targetId)
- "straight_line_to_target" (Locks a straight-line vector toward targetId at behavior.speed, and when hitting any stage boundary respawns at top and aims straight toward targetId again)
- "static" (Stationary)

Your job:
- Understand WHICH parts of the game program need to change based on the user's 4 prompt fields.
- Modify ONLY the affected entities, speeds, behaviors, world settings, or rules.
- Keep unrelated rules (such as existing scoring or win/lose rules) intact if the user says "no change" or leaves that section unchanged.
- Preserve existing entity IDs and keep coordinates within x: 40..760, y: 50..460, scale: 0.6..2.2.
- Return ONLY a valid JSON object with this exact shape:
{
  "blueprint": { ...GameBlueprint v1.0 },
  "changesEn": "One clear sentence explaining what was updated in English",
  "changesHi": "हिंदी में एक स्पष्ट वाक्य जो बताए कि क्या बदला गया"
}`;

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
        changesEn: "GROQ_API_KEY missing in .env.local — used local compiler.",
        changesHi: ".env.local में GROQ_API_KEY नहीं है — लोकल कंपाइलर चला।",
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

    return NextResponse.json({
      blueprint: validated,
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