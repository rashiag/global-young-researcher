import { GameBlueprint, GameEntity, GameRule, SfxKey } from "@/types/gameBlueprint";
import { getSpriteByKey } from "./assetRegistry";
import { CanvasRenderer, EntityVisualState, FloatingPop, Particle } from "./CanvasRenderer";
import { soundSynth } from "./SoundSynth";

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jumpPressed: boolean;
}

export interface HeadlessSimReport {
  hasPlayer: boolean;
  hasCollectibleOrTarget: boolean;
  winRuleThreshold: number | null;
  simulatedScoreAfter10s: number;
  maxPossibleScoreIn10s: number;
  playerMoved: boolean;
  issues: string[];
}

interface RuntimeBody {
  entity: GameEntity;
  vx: number;
  vy: number;
  patrolDir: number;
  spawnTimer: number;
  onGround: boolean;
  hitCooldown: number;
}

export class GameRuntime {
  private blueprint: GameBlueprint;
  private bodies: RuntimeBody[] = [];
  private visualStates = new Map<string, EntityVisualState>();
  private particles: Particle[] = [];
  private pops: FloatingPop[] = [];

  public score = 0;
  public lives = 3;
  public timeLeft: number | null = null;
  public status: "running" | "won" | "lost" = "running";
  private elapsedSec = 0;

  constructor(blueprint: GameBlueprint) {
    this.blueprint = blueprint;
    this.reset(blueprint);
  }

  public reset(nextBlueprint?: GameBlueprint): void {
    if (nextBlueprint) {
      this.blueprint = nextBlueprint;
    }
    this.score = this.blueprint.world.initialScore;
    this.lives = this.blueprint.world.initialLives;
    this.timeLeft = this.blueprint.world.timerSeconds;
    this.status = "running";
    this.elapsedSec = 0;
    this.particles = [];
    this.pops = [];
    this.visualStates.clear();

    this.bodies = this.blueprint.entities.map((ent, idx) => {
      this.visualStates.set(ent.id, {
        scaleX: 1,
        scaleY: 1,
        bobPhase: idx * 1.1,
      });
      return {
        entity: { ...ent, behavior: { ...ent.behavior } },
        vx: 0,
        vy: 0,
        patrolDir: ent.flipX ? -1 : 1,
        spawnTimer: 0,
        onGround: ent.y >= CanvasRenderer.STAGE_HEIGHT - 85,
        hitCooldown: 0,
      };
    });
  }

  public step(dtSec: number, input: InputState, playAudio = true): void {
    const clampedDt = Math.min(dtSec, 0.05);
    const frameScale = clampedDt * 60;
    this.elapsedSec += clampedDt;

    // Decay visual squash/stretch back toward (1, 1)
    for (const vis of this.visualStates.values()) {
      vis.scaleX += (1 - vis.scaleX) * Math.min(1, frameScale * 0.22);
      vis.scaleY += (1 - vis.scaleY) * Math.min(1, frameScale * 0.22);
    }

    this.updateParticlesAndPops(clampedDt, frameScale);

    if (this.status !== "running") return;

    if (this.timeLeft !== null) {
      this.timeLeft -= clampedDt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.fireTriggers("on_timer_end", undefined, undefined, playAudio);
      }
    }

    const floorY = CanvasRenderer.STAGE_HEIGHT - 85;
    const gravity = this.blueprint.world.gravity;

    for (const b of this.bodies) {
      if (b.hitCooldown > 0) {
        b.hitCooldown = Math.max(0, b.hitCooldown - clampedDt);
      }

      const ent = b.entity;
      const beh = ent.behavior;
      const spd = beh.speed || 4;

      switch (beh.type) {
        case "player_horizontal": {
          b.vx = 0;
          if (input.left) {
            b.vx = -spd;
            ent.flipX = true;
          }
          if (input.right) {
            b.vx = spd;
            ent.flipX = false;
          }
          ent.x += b.vx * frameScale;
          break;
        }
        case "player_4way": {
          b.vx = 0;
          b.vy = 0;
          if (input.left) {
            b.vx = -spd;
            ent.flipX = true;
          }
          if (input.right) {
            b.vx = spd;
            ent.flipX = false;
          }
          if (input.up) b.vy = -spd;
          if (input.down) b.vy = spd;
          ent.x += b.vx * frameScale;
          ent.y += b.vy * frameScale;
          break;
        }
        case "player_platformer": {
          b.vx = 0;
          if (input.left) {
            b.vx = -spd;
            ent.flipX = true;
          }
          if (input.right) {
            b.vx = spd;
            ent.flipX = false;
          }
          if ((input.jumpPressed || input.up) && b.onGround) {
            b.vy = -(beh.jumpForce || 12);
            b.onGround = false;
            this.squash(ent.id, 0.8, 1.25);
            if (playAudio) soundSynth.play("jump");
          }
          b.vy += (gravity || 0.45) * frameScale;
          ent.x += b.vx * frameScale;
          ent.y += b.vy * frameScale;
          if (ent.y >= floorY) {
            if (!b.onGround && b.vy > 3) {
              this.squash(ent.id, 1.22, 0.8);
            }
            ent.y = floorY;
            b.vy = 0;
            b.onGround = true;
          }
          break;
        }
        case "patrol_horizontal": {
          ent.x += b.patrolDir * spd * frameScale;
          if (ent.x < 50) {
            ent.x = 50;
            b.patrolDir = 1;
            ent.flipX = false;
          } else if (ent.x > CanvasRenderer.STAGE_WIDTH - 50) {
            ent.x = CanvasRenderer.STAGE_WIDTH - 50;
            b.patrolDir = -1;
            ent.flipX = true;
          }
          break;
        }
        case "patrol_vertical": {
          ent.y += b.patrolDir * spd * frameScale;
          if (ent.y < 70) {
            ent.y = 70;
            b.patrolDir = 1;
          } else if (ent.y > floorY) {
            ent.y = floorY;
            b.patrolDir = -1;
          }
          break;
        }
        case "spawn_and_fall": {
          ent.y += spd * frameScale;
          b.spawnTimer += clampedDt;
          const interval = beh.spawnIntervalSec || 1.5;
          if (ent.y > CanvasRenderer.STAGE_HEIGHT + 30 || b.spawnTimer > interval * 4) {
            this.respawnAtTop(b);
          }
          break;
        }
        case "float_random": {
          ent.x += Math.cos(this.elapsedSec * 1.6 + ent.x * 0.01) * spd * 0.45 * frameScale;
          ent.y += Math.sin(this.elapsedSec * 2.1 + ent.y * 0.01) * spd * 0.45 * frameScale;
          break;
        }
        case "chase_target": {
          const target =
            this.bodies.find((t) => t.entity.id === beh.targetId) ??
            this.bodies.find((t) => t.entity.behavior.type.startsWith("player_")) ??
            this.bodies[0];
          if (target && target.entity.id !== ent.id) {
            const dx = target.entity.x - ent.x;
            const dy = target.entity.y - ent.y;
            const dist = Math.hypot(dx, dy) || 1;
            ent.x += (dx / dist) * spd * 0.65 * frameScale;
            ent.y += (dy / dist) * spd * 0.65 * frameScale;
            ent.flipX = dx < 0;
          }
          break;
        }
        case "straight_line_to_target": {
          const target =
            this.bodies.find((t) => t.entity.id === beh.targetId) ??
            this.bodies.find((t) => t.entity.behavior.type.startsWith("player_")) ??
            this.bodies[0];
          if (target && target.entity.id !== ent.id) {
            if (b.vx === 0 && b.vy === 0) {
              const dx = target.entity.x - ent.x;
              const dy = target.entity.y - ent.y;
              const dist = Math.hypot(dx, dy) || 1;
              b.vx = (dx / dist) * spd;
              b.vy = (dy / dist) * spd;
              ent.flipX = dx < 0;
            }
            ent.x += b.vx * frameScale;
            ent.y += b.vy * frameScale;

            const hitBoundary =
              ent.x <= 38 ||
              ent.x >= CanvasRenderer.STAGE_WIDTH - 38 ||
              ent.y <= 50 ||
              ent.y >= CanvasRenderer.STAGE_HEIGHT - 38;
            if (hitBoundary) {
              ent.x = 70 + Math.random() * (CanvasRenderer.STAGE_WIDTH - 140);
              ent.y = 60 + Math.random() * 95;
              const dx = target.entity.x - ent.x;
              const dy = target.entity.y - ent.y;
              const dist = Math.hypot(dx, dy) || 1;
              b.vx = (dx / dist) * spd;
              b.vy = (dy / dist) * spd;
              ent.flipX = dx < 0;
            }
          }
          break;
        }
        case "static":
        default:
          break;
      }

      // Clamp within stage bounds
      ent.x = Math.max(36, Math.min(CanvasRenderer.STAGE_WIDTH - 36, ent.x));
      ent.y = Math.max(48, Math.min(CanvasRenderer.STAGE_HEIGHT - 36, ent.y));
    }

    // Check collisions for enabled on_collide rules
    for (const rule of this.blueprint.rules) {
      if (!rule.enabled || rule.trigger.type !== "on_collide") continue;
      const srcBody = this.bodies.find((b) => b.entity.id === rule.trigger.sourceId);
      const tgtBody = this.bodies.find((b) => b.entity.id === rule.trigger.targetId);
      if (!srcBody || !tgtBody || srcBody.entity.id === tgtBody.entity.id) continue;

      const r1 = this.getRadius(srcBody.entity);
      const r2 = this.getRadius(tgtBody.entity);
      const dist = Math.hypot(srcBody.entity.x - tgtBody.entity.x, srcBody.entity.y - tgtBody.entity.y);

      if (dist < r1 + r2) {
        if (srcBody.hitCooldown > 0 || tgtBody.hitCooldown > 0) continue;
        srcBody.hitCooldown = 0.45;
        tgtBody.hitCooldown = 0.25;
        this.applyRuleActions(rule, srcBody, tgtBody, playAudio);
      }
    }

    // Check score & lives triggers
    for (const rule of this.blueprint.rules) {
      if (!rule.enabled) continue;
      if (rule.trigger.type === "on_score_reach" && typeof rule.trigger.threshold === "number") {
        if (this.score >= rule.trigger.threshold) {
          this.applyRuleActions(rule, undefined, undefined, playAudio);
        }
      } else if (rule.trigger.type === "on_lives_zero" && this.lives <= 0) {
        this.applyRuleActions(rule, undefined, undefined, playAudio);
      }
    }
  }

  private fireTriggers(
    type: GameRule["trigger"]["type"],
    srcBody: RuntimeBody | undefined,
    tgtBody: RuntimeBody | undefined,
    playAudio: boolean
  ): void {
    for (const rule of this.blueprint.rules) {
      if (rule.enabled && rule.trigger.type === type) {
        this.applyRuleActions(rule, srcBody, tgtBody, playAudio);
      }
    }
  }

  private applyRuleActions(
    rule: GameRule,
    srcBody: RuntimeBody | undefined,
    tgtBody: RuntimeBody | undefined,
    playAudio: boolean
  ): void {
    for (const act of rule.actions) {
      if (act.sfx && playAudio) {
        soundSynth.play(act.sfx as SfxKey);
      }
      switch (act.type) {
        case "add_score": {
          const delta = act.value ?? 10;
          this.score += delta;
          if (tgtBody) {
            this.spawnPop(
              tgtBody.entity.x,
              tgtBody.entity.y - 24,
              delta >= 0 ? `+${delta}` : `${delta}`,
              delta >= 0 ? "#fde047" : "#fb7185"
            );
            this.spawnBurst(tgtBody.entity.x, tgtBody.entity.y, delta >= 0 ? "#facc15" : "#f43f5e", 10);
          }
          break;
        }
        case "lose_life": {
          const dec = act.value ?? 1;
          this.lives = Math.max(0, this.lives - dec);
          if (srcBody) srcBody.hitCooldown = 0.9;
          if (tgtBody) { tgtBody.hitCooldown = 0.9; if (tgtBody.entity.behavior.type === "straight_line_to_target") this.respawnAtTop(tgtBody); else tgtBody.entity.y = Math.max(60, tgtBody.entity.y - 45); }
          if (srcBody) {
            this.squash(srcBody.entity.id, 1.25, 0.78);
            this.spawnPop(srcBody.entity.x, srcBody.entity.y - 30, `-${dec} ❤️`, "#fb7185");
            this.spawnBurst(srcBody.entity.x, srcBody.entity.y, "#fb7185", 12);
          }
          break;
        }
        case "gain_life": {
          const inc = act.value ?? 1;
          this.lives += inc;
          if (srcBody) {
            this.spawnPop(srcBody.entity.x, srcBody.entity.y - 30, `+${inc} ❤️`, "#4ade80");
          }
          break;
        }
        case "destroy_target": {
          if (tgtBody) {
            this.respawnAtTop(tgtBody);
          }
          break;
        }
        case "respawn_source": {
          if (srcBody) {
            srcBody.entity.x = 120;
            srcBody.entity.y = CanvasRenderer.STAGE_HEIGHT - 85;
            srcBody.vy = 0;
          }
          break;
        }
        case "bounce_source": {
          if (srcBody) {
            srcBody.vy = -(act.value ?? 10);
            srcBody.onGround = false;
            this.squash(srcBody.entity.id, 0.82, 1.24);
          }
          break;
        }
        case "win_game": {
          if (this.status === "running") {
            this.status = "won";
            this.spawnBurst(CanvasRenderer.STAGE_WIDTH / 2, CanvasRenderer.STAGE_HEIGHT / 2, "#4ade80", 36);
            this.spawnBurst(CanvasRenderer.STAGE_WIDTH / 2, CanvasRenderer.STAGE_HEIGHT / 2, "#facc15", 36);
          }
          break;
        }
        case "lose_game": {
          if (this.status === "running") {
            this.status = "lost";
          }
          break;
        }
        default:
          break;
      }
    }
  }

  private respawnAtTop(b: RuntimeBody): void {
    b.entity.x = 70 + Math.random() * (CanvasRenderer.STAGE_WIDTH - 140);
    b.entity.y = 55;
    b.spawnTimer = 0;
    b.hitCooldown = 0.4;
  }

  private squash(entityId: string, sx: number, sy: number): void {
    const vis = this.visualStates.get(entityId);
    if (vis) {
      vis.scaleX = sx;
      vis.scaleY = sy;
    }
  }

  private getRadius(ent: GameEntity): number {
    const asset = getSpriteByKey(ent.spriteKey);
    return (asset.defaultSize * ent.scale) * 0.38;
  }

  private spawnBurst(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 1.5 + Math.random() * 4.2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 3 + Math.random() * 4,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.25,
      });
    }
  }

  private spawnPop(x: number, y: number, text: string, color: string): void {
    this.pops.push({
      x,
      y,
      vy: -42,
      text,
      color,
      alpha: 1,
      life: 0,
    });
  }

  private updateParticlesAndPops(dt: number, frameScale: number): void {
    this.particles = this.particles.filter((p) => {
      p.life += dt;
      p.x += p.vx * frameScale;
      p.y += p.vy * frameScale;
      p.vy += 0.12 * frameScale;
      p.alpha = 1 - p.life / p.maxLife;
      return p.life < p.maxLife;
    });

    this.pops = this.pops.filter((pop) => {
      pop.life += dt;
      pop.y += pop.vy * dt;
      pop.alpha = 1 - pop.life / 0.85;
      return pop.life < 0.85;
    });
  }

  public render(ctx: CanvasRenderingContext2D, dpr: number, renderer: CanvasRenderer): void {
    const currentEntities = this.bodies.map((b) => b.entity);
    const snapshotBlueprint: GameBlueprint = {
      ...this.blueprint,
      entities: currentEntities,
    };

    renderer.render(ctx, dpr, snapshotBlueprint, {
      mode: "play",
      selectedEntityId: null,
      score: this.score,
      lives: this.lives,
      timeLeft: this.timeLeft,
      status: this.status,
      visualStates: this.visualStates,
      particles: this.particles,
      pops: this.pops,
      nowSec: this.elapsedSec,
    });
  }
}

/**
 * Fast headless evaluator used by our Playtest & Debug Buddy agent
 * to detect static players, unreachable win scores, or missing interactions.
 */
export function simulateBlueprint(blueprint: GameBlueprint): HeadlessSimReport {
  const issues: string[] = [];
  const playerBodies = blueprint.entities.filter((e) => e.behavior.type.startsWith("player_"));
  const hasPlayer = playerBodies.length > 0;

  if (!hasPlayer) {
    issues.push("No character has a player movement behavior yet.");
  }

  const winRule = blueprint.rules.find((r) => r.enabled && r.trigger.type === "on_score_reach");
  const winRuleThreshold = winRule?.trigger.threshold ?? null;

  let totalScoreGainPerHit = 0;
  let hasRespawn = false;
  for (const r of blueprint.rules) {
    if (!r.enabled) continue;
    for (const a of r.actions) {
      if (a.type === "add_score" && (a.value ?? 0) > 0) {
        totalScoreGainPerHit += a.value ?? 0;
      }
      if (a.type === "destroy_target" || a.type === "respawn_source") {
        hasRespawn = true;
      }
    }
  }

  const hasCollectibleOrTarget = blueprint.rules.some(
    (r) => r.enabled && r.trigger.type === "on_collide"
  );

  const sim = new GameRuntime(blueprint);
  const startXs = blueprint.entities.map((e) => e.x);

  // Run 10 seconds at 30Hz headless steps (~300 ticks)
  for (let i = 0; i < 300; i++) {
    const cycle = i % 60;
    sim.step(
      1 / 30,
      {
        left: cycle < 20,
        right: cycle >= 20 && cycle < 40,
        up: cycle === 45,
        down: false,
        jumpPressed: cycle === 45,
      },
      false
    );
  }

  const endXs = blueprint.entities.map((e) => e.x);
  const playerMoved = startXs.some((sx, idx) => Math.abs(sx - endXs[idx]) > 4);

  const estimatedHitsIn10s = hasRespawn ? 8 : Math.max(1, blueprint.entities.length - 1);
  const maxPossibleScoreIn10s =
    blueprint.world.initialScore + Math.max(totalScoreGainPerHit, 10) * estimatedHitsIn10s;

  if (winRuleThreshold !== null && totalScoreGainPerHit <= 0) {
    issues.push(`Win condition is set to ${winRuleThreshold} points, but no rule adds positive points.`);
  } else if (winRuleThreshold !== null && winRuleThreshold > maxPossibleScoreIn10s * 3 && !hasRespawn) {
    issues.push(`Win score (${winRuleThreshold}) is hard to reach without items respawning or more collectibles.`);
  }

  return {
    hasPlayer,
    hasCollectibleOrTarget,
    winRuleThreshold,
    simulatedScoreAfter10s: sim.score,
    maxPossibleScoreIn10s,
    playerMoved,
    issues,
  };
}
