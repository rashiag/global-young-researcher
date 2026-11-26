import { GameBlueprint, GameEntity, GameRule } from "@/types/gameBlueprint";
import { getBackdropByKey, getSpriteByKey } from "./assetRegistry";
import { CanvasRenderer } from "./CanvasRenderer";
import { simulateBlueprint } from "./GameRuntime";

export function validateBlueprint(raw: unknown, fallback: GameBlueprint): GameBlueprint {
  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const candidate = raw as Partial<GameBlueprint>;
  const title =
    typeof candidate.title === "string" && candidate.title.trim().length > 0
      ? candidate.title.trim().slice(0, 60)
      : fallback.title;

  const rawWorld = (candidate.world ?? {}) as Partial<GameBlueprint["world"]>;
  const backdrop = getBackdropByKey(
    typeof rawWorld.backdropKey === "string" ? rawWorld.backdropKey : fallback.world.backdropKey
  );

  const entities: GameEntity[] = Array.isArray(candidate.entities)
    ? candidate.entities
        .filter((e): e is GameEntity => Boolean(e && typeof e === "object" && typeof e.id === "string"))
        .map((e, idx) => {
          const sprite = getSpriteByKey(
            typeof e.spriteKey === "string" ? e.spriteKey : "mango"
          );
          const x =
            typeof e.x === "number" && Number.isFinite(e.x)
              ? Math.max(36, Math.min(CanvasRenderer.STAGE_WIDTH - 36, e.x))
              : 140 + ((idx * 150) % 520);
          const y =
            typeof e.y === "number" && Number.isFinite(e.y)
              ? Math.max(48, Math.min(CanvasRenderer.STAGE_HEIGHT - 36, e.y))
              : 220;
          const scale =
            typeof e.scale === "number" && Number.isFinite(e.scale)
              ? Math.max(0.5, Math.min(2.5, e.scale))
              : 1;
          const speed =
            typeof e.behavior?.speed === "number" && Number.isFinite(e.behavior.speed)
              ? Math.max(0, Math.min(16, e.behavior.speed))
              : 4;

          return {
            id: e.id.slice(0, 40),
            name:
              typeof e.name === "string" && e.name.trim().length > 0
                ? e.name.trim().slice(0, 24)
                : sprite.nameEn,
            spriteKey: sprite.key,
            x,
            y,
            scale,
            flipX: Boolean(e.flipX),
            behavior: {
              type: e.behavior?.type ?? "static",
              speed,
              jumpForce:
                typeof e.behavior?.jumpForce === "number" && Number.isFinite(e.behavior.jumpForce)
                  ? Math.max(4, Math.min(22, e.behavior.jumpForce))
                  : 12,
              spawnIntervalSec:
                typeof e.behavior?.spawnIntervalSec === "number" &&
                Number.isFinite(e.behavior.spawnIntervalSec)
                  ? Math.max(0.4, Math.min(8, e.behavior.spawnIntervalSec))
                  : 1.5,
              targetId: typeof e.behavior?.targetId === "string" ? e.behavior.targetId : undefined,
            },
          };
        })
    : fallback.entities;

  const validIds = new Set(entities.map((e) => e.id));

  const rules: GameRule[] = (Array.isArray(candidate.rules) && candidate.rules.length > 0)
    ? candidate.rules
        .filter((r): r is GameRule => Boolean(r && typeof r === "object" && typeof r.trigger?.type === "string"))
        .map((r, idx) => {
          const sourceId =
            r.trigger.sourceId && validIds.has(r.trigger.sourceId)
              ? r.trigger.sourceId
              : entities.find((e) => e.behavior.type.startsWith("player_"))?.id ?? entities[0]?.id;
          const targetId =
            r.trigger.targetId && validIds.has(r.trigger.targetId)
              ? r.trigger.targetId
              : entities.find((e) => e.id !== sourceId)?.id;

          const safeActions = Array.isArray(r.actions)
            ? r.actions.filter((a) => Boolean(a && typeof a.type === "string")).slice(0, 6)
            : [];

          return {
            id: typeof r.id === "string" && r.id.length > 0 ? r.id : `rule_${idx + 1}`,
            enabled: typeof r.enabled === "boolean" ? r.enabled : true,
            summaryEn:
              typeof r.summaryEn === "string" && r.summaryEn.trim().length > 0
                ? r.summaryEn.trim()
                : "Custom game rule",
            summaryHi:
              typeof r.summaryHi === "string" && r.summaryHi.trim().length > 0
                ? r.summaryHi.trim()
                : "कस्टम गेम नियम",
            trigger: {
              type: r.trigger.type,
              sourceId,
              targetId,
              threshold:
                typeof r.trigger.threshold === "number" && Number.isFinite(r.trigger.threshold)
                  ? r.trigger.threshold
                  : undefined,
            },
            actions: safeActions,
          };
        })
    : fallback.rules;

  const usesScore = rules.some(
    (r) =>
      r.trigger.type === "on_score_reach" ||
      r.actions.some((a) => a.type === "add_score")
  );
  const usesLives = rules.some(
    (r) =>
      r.trigger.type === "on_lives_zero" ||
      r.actions.some((a) => a.type === "lose_life" || a.type === "gain_life")
  );

  return {
    version: "1.0",
    title,
    world: {
      backdropKey: backdrop.key,
      gravity:
        typeof rawWorld.gravity === "number" && Number.isFinite(rawWorld.gravity)
          ? Math.max(0, Math.min(2, rawWorld.gravity))
          : fallback.world.gravity,
      initialScore:
        typeof rawWorld.initialScore === "number" && Number.isFinite(rawWorld.initialScore)
          ? rawWorld.initialScore
          : 0,
      initialLives:
        typeof rawWorld.initialLives === "number" && Number.isFinite(rawWorld.initialLives)
          ? Math.max(1, Math.min(10, Math.round(rawWorld.initialLives)))
          : 3,
      timerSeconds:
        typeof rawWorld.timerSeconds === "number" &&
        Number.isFinite(rawWorld.timerSeconds) &&
        rawWorld.timerSeconds > 0
          ? Math.min(300, Math.round(rawWorld.timerSeconds))
          : null,
      showScoreHud:
        typeof rawWorld.showScoreHud === "boolean"
          ? rawWorld.showScoreHud
          : usesScore || fallback.world.showScoreHud,
      showLivesHud:
        typeof rawWorld.showLivesHud === "boolean"
          ? rawWorld.showLivesHud
          : usesLives || fallback.world.showLivesHud,
    },
    entities,
    rules,
    coachingTip: typeof candidate.coachingTip === "string" ? candidate.coachingTip : undefined,
  };
}

/**
 * Evaluator-Optimizer helper: observes headless simulation issues and patches
 * common deadlocks (static player or unwinnable score threshold).
 */
export function runPlaytestAgent(blueprint: GameBlueprint): {
  blueprint: GameBlueprint;
  fixesAppliedEn: string[];
  fixesAppliedHi: string[];
  issuesRemaining: string[];
} {
  let current = validateBlueprint(blueprint, blueprint);
  const fixesAppliedEn: string[] = [];
  const fixesAppliedHi: string[] = [];

  for (let attempt = 0; attempt < 2; attempt++) {
    const report = simulateBlueprint(current);
    if (report.issues.length === 0) break;

    if (!report.hasPlayer && current.entities.length > 0) {
      const hero = current.entities[0];
      current = {
        ...current,
        entities: current.entities.map((e, idx) =>
          idx === 0
            ? { ...e, behavior: { ...e.behavior, type: "player_horizontal", speed: e.behavior.speed || 6 } }
            : e
        ),
      };
      fixesAppliedEn.push(`Gave ${hero.name} Left/Right movement controls.`);
      fixesAppliedHi.push(`${hero.name} को बाएँ-दाएँ चलने का नियंत्रण दिया।`);
      continue;
    }

    if (report.winRuleThreshold !== null && current.entities.length >= 2) {
      const player = current.entities.find((e) => e.behavior.type.startsWith("player_")) ?? current.entities[0];
      const item = current.entities.find((e) => e.id !== player.id) ?? current.entities[0];
      const newRule: GameRule = {
        id: `auto_score_${Date.now()}`,
        enabled: true,
        summaryEn: `Touching ${item.name} -> +10 Score, pop sound, respawn`,
        summaryHi: `${item.name} छूने पर -> +10 अंक, पॉप आवाज़, फिर आए`,
        trigger: { type: "on_collide", sourceId: player.id, targetId: item.id },
        actions: [
          { type: "add_score", value: 10 },
          { type: "play_sfx", sfx: "pop" },
          { type: "destroy_target" },
        ],
      };
      current = {
        ...current,
        world: { ...current.world, showScoreHud: true },
        rules: [...current.rules, newRule],
      };
      fixesAppliedEn.push(`Added +10 points when ${player.name} touches ${item.name} so you can reach ${report.winRuleThreshold} points.`);
      fixesAppliedHi.push(`${player.name} द्वारा ${item.name} छूने पर +10 अंक जोड़े ताकि ${report.winRuleThreshold} अंक पूरे हो सकें।`);
      continue;
    }

    break;
  }

  const finalReport = simulateBlueprint(current);
  return {
    blueprint: current,
    fixesAppliedEn,
    fixesAppliedHi,
    issuesRemaining: finalReport.issues,
  };
}
