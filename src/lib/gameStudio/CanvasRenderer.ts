import { GameBlueprint, GameEntity } from "@/types/gameBlueprint";
import { getBackdropByKey, getSpriteByKey } from "./assetRegistry";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FloatingPop {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
}

export interface EntityVisualState {
  scaleX: number;
  scaleY: number;
  bobPhase: number;
}

export class CanvasRenderer {
  public static readonly STAGE_WIDTH = 800;
  public static readonly STAGE_HEIGHT = 500;

  private imageCache = new Map<string, HTMLImageElement | "failed">();

  private getOrLoadImage(path: string): HTMLImageElement | null {
    const cached = this.imageCache.get(path);
    if (cached === "failed") return null;
    if (cached) return cached.complete && cached.naturalWidth > 0 ? cached : null;

    if (typeof Image === "undefined") return null;
    const img = new Image();
    img.src = path;
    img.onload = () => {
      this.imageCache.set(path, img);
    };
    img.onerror = () => {
      this.imageCache.set(path, "failed");
    };
    this.imageCache.set(path, img);
    return null;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    dpr: number,
    blueprint: GameBlueprint,
    options: {
      mode: "edit" | "play";
      selectedEntityId: string | null;
      score: number;
      lives: number;
      timeLeft: number | null;
      status: "running" | "won" | "lost";
      visualStates: Map<string, EntityVisualState>;
      particles: Particle[];
      pops: FloatingPop[];
      nowSec: number;
    }
  ): void {
    const w = CanvasRenderer.STAGE_WIDTH;
    const h = CanvasRenderer.STAGE_HEIGHT;

    ctx.save();
    ctx.scale(dpr, dpr);

    const backdrop = getBackdropByKey(blueprint.world.backdropKey);
    const bgImg = this.getOrLoadImage(backdrop.imagePath);
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, w, h);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, h * 0.82);
      grad.addColorStop(0, backdrop.skyTop);
      grad.addColorStop(1, backdrop.skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h * 0.82);

      if (backdrop.key === "space") {
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 30; i++) {
          const sx = ((i * 97) % (w - 40)) + 20;
          const sy = ((i * 53) % (h * 0.72)) + 16;
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(options.nowSec * 2 + i));
          ctx.globalAlpha = tw;
          ctx.beginPath();
          ctx.arc(sx, sy, i % 3 === 0 ? 2.5 : 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = backdrop.accentColor;
        ctx.globalAlpha = 0.28;
        ctx.beginPath();
        ctx.arc(670, 95, 44, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        const drift = Math.sin(options.nowSec * 0.5) * 14;
        this.drawSoftCloud(ctx, 150 + drift, 85, 0.9);
        this.drawSoftCloud(ctx, 450 - drift * 0.7, 65, 0.75);
      }

      ctx.fillStyle = backdrop.groundColor;
      ctx.fillRect(0, h * 0.8, w, h * 0.2);
      ctx.fillStyle = "rgba(255,255,255,0.24)";
      ctx.fillRect(0, h * 0.8, w, 6);
    }

    for (const entity of blueprint.entities) {
      this.drawEntity(ctx, entity, options);
    }

    for (const p of options.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const pop of options.pops) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pop.alpha);
      ctx.font = "bold 20px ui-rounded, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(15, 23, 42, 0.75)";
      ctx.strokeText(pop.text, pop.x, pop.y);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }

    this.drawHud(ctx, blueprint, options);

    if (options.mode === "play" && options.status !== "running") {
      this.drawEndBanner(ctx, options.status, options.score);
    }

    ctx.restore();
  }

  private drawSoftCloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.arc(22, -6, 26, 0, Math.PI * 2);
    ctx.arc(46, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawEntity(
    ctx: CanvasRenderingContext2D,
    entity: GameEntity,
    options: {
      mode: "edit" | "play";
      selectedEntityId: string | null;
      visualStates: Map<string, EntityVisualState>;
      nowSec: number;
    }
  ): void {
    const asset = getSpriteByKey(entity.spriteKey);
    const baseSize = asset.defaultSize * entity.scale;
    const vis = options.visualStates.get(entity.id) ?? { scaleX: 1, scaleY: 1, bobPhase: 0 };
    const idleBob = options.mode === "play" ? Math.sin(options.nowSec * 4.5 + vis.bobPhase) * 2.5 : 0;

    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
    ctx.beginPath();
    ctx.ellipse(entity.x, entity.y + baseSize * 0.46, baseSize * 0.36, baseSize * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(entity.x, entity.y + idleBob);
    ctx.scale(entity.flipX ? -vis.scaleX : vis.scaleX, vis.scaleY);

    const spriteImg = this.getOrLoadImage(asset.imagePath);
    if (spriteImg) {
      ctx.drawImage(spriteImg, -baseSize / 2, -baseSize / 2, baseSize, baseSize);
    } else {
      this.drawScratchCostume(ctx, entity.spriteKey, baseSize, options.nowSec + vis.bobPhase);
    }
    ctx.restore();

    if (options.mode === "edit") {
      const isSelected = entity.id === options.selectedEntityId;
      ctx.save();
      ctx.font = "600 12px system-ui, sans-serif";
      ctx.textAlign = "center";
      const label = `${entity.name} (${entity.behavior.speed})`;
      const textW = ctx.measureText(label).width + 14;
      const pillY = entity.y - baseSize * 0.56 - 18;

      ctx.fillStyle = isSelected ? "#4f46e5" : "rgba(15, 23, 42, 0.8)";
      this.roundRect(ctx, entity.x - textW / 2, pillY, textW, 20, 10);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, entity.x, pillY + 13);

      if (isSelected) {
        const boxPad = 8;
        const half = baseSize / 2 + boxPad;
        ctx.strokeStyle = "#4f46e5";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(entity.x - half, entity.y - half, half * 2, half * 2);
        ctx.setLineDash([]);

        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#4f46e5";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(entity.x + half, entity.y + half, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private drawScratchCostume(
    ctx: CanvasRenderingContext2D,
    key: string,
    size: number,
    t: number
  ): void {
    const u = size * 0.02;
    const swing = Math.sin(t * 7) * 6 * u;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(2.2, 2.4 * u);
    ctx.strokeStyle = "#1e293b";

    if (key === "bittu" || key === "tara" || key === "astronaut") {
      const isTara = key === "tara";
      const isAstro = key === "astronaut";
      const shirtColor = isAstro ? "#f8fafc" : isTara ? "#ec4899" : "#3b82f6";
      const hairColor = isTara ? "#7c2d12" : "#1e1b4b";

      ctx.fillStyle = isAstro ? "#cbd5e1" : "#1e3a8a";
      this.roundRect(ctx, -11 * u, 8 * u + swing * 0.4, 8 * u, 13 * u, 3 * u);
      ctx.fill();
      ctx.stroke();
      this.roundRect(ctx, 3 * u, 8 * u - swing * 0.4, 8 * u, 13 * u, 3 * u);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = shirtColor;
      this.roundRect(ctx, -19 * u, -4 * u - swing * 0.5, 8 * u, 12 * u, 4 * u);
      ctx.fill();
      ctx.stroke();
      this.roundRect(ctx, 11 * u, -4 * u + swing * 0.5, 8 * u, 12 * u, 4 * u);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = shirtColor;
      this.roundRect(ctx, -12 * u, -5 * u, 24 * u, 17 * u, 7 * u);
      ctx.fill();
      ctx.stroke();

      if (isTara) {
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.ellipse(-18 * u, -14 * u, 7 * u, 10 * u, -0.4, 0, Math.PI * 2);
        ctx.ellipse(18 * u, -14 * u, 7 * u, 10 * u, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = isAstro ? "#e0f2fe" : "#fed7aa";
      ctx.beginPath();
      ctx.arc(0, -14 * u, 13 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (isAstro) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3 * u;
        ctx.beginPath();
        ctx.arc(0, -14 * u, 15.5 * u, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = Math.max(2.2, 2.4 * u);
      } else {
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.arc(0, -17 * u, 13.2 * u, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(-4.5 * u, -13 * u, 2.1 * u, 0, Math.PI * 2);
      ctx.arc(4.5 * u, -13 * u, 2.1 * u, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, -9.5 * u, 4.5 * u, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      return;
    }

    if (key === "dino") {
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.moveTo(-10 * u, 8 * u);
      ctx.quadraticCurveTo(-24 * u, 4 * u, -22 * u, -6 * u);
      ctx.quadraticCurveTo(-14 * u, 0, -9 * u, 2 * u);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#fbbf24";
      for (const sx of [-11, -3, 5]) {
        ctx.beginPath();
        ctx.moveTo(sx * u, -18 * u);
        ctx.lineTo((sx + 3) * u, -24 * u);
        ctx.lineTo((sx + 6) * u, -17 * u);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = "#22c55e";
      this.roundRect(ctx, -13 * u, -6 * u, 24 * u, 22 * u, 8 * u);
      ctx.fill();
      ctx.stroke();

      this.roundRect(ctx, -8 * u, -20 * u, 23 * u, 16 * u, 7 * u);
      ctx.fill();
      ctx.stroke();

      this.roundRect(ctx, -10 * u, 12 * u + swing * 0.35, 8 * u, 9 * u, 3 * u);
      ctx.fill();
      ctx.stroke();
      this.roundRect(ctx, 2 * u, 12 * u - swing * 0.35, 8 * u, 9 * u, 3 * u);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(5 * u, -14 * u, 2.2 * u, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (key === "bunny") {
      ctx.fillStyle = "#f8fafc";
      this.roundRect(ctx, -10 * u, -28 * u, 7 * u, 18 * u, 3.5 * u);
      ctx.fill();
      ctx.stroke();
      this.roundRect(ctx, 3 * u, -28 * u, 7 * u, 18 * u, 3.5 * u);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#f9a8d4";
      this.roundRect(ctx, -8 * u, -25 * u, 3 * u, 12 * u, 1.5 * u);
      ctx.fill();
      this.roundRect(ctx, 5 * u, -25 * u, 3 * u, 12 * u, 1.5 * u);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(0, 8 * u, 13 * u, 11 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -7 * u, 12 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(-4.5 * u, -8 * u, 2 * u, 0, Math.PI * 2);
      ctx.arc(4.5 * u, -8 * u, 2 * u, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.arc(0, -4.5 * u, 2.2 * u, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (key === "robot") {
      ctx.beginPath();
      ctx.moveTo(0, -14 * u);
      ctx.lineTo(0, -23 * u);
      ctx.stroke();
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(0, -25 * u, 3.5 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      this.roundRect(ctx, -14 * u, -14 * u, 28 * u, 26 * u, 7 * u);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#0f172a";
      this.roundRect(ctx, -10 * u, -8 * u, 20 * u, 10 * u, 3 * u);
      ctx.fill();

      ctx.fillStyle = "#4ade80";
      ctx.beginPath();
      ctx.arc(-4.5 * u, -3 * u, 2.5 * u, 0, Math.PI * 2);
      ctx.arc(4.5 * u, -3 * u, 2.5 * u, 0, Math.PI * 2);
      ctx.fill();

      this.roundRect(ctx, -9 * u, 12 * u + swing * 0.3, 6 * u, 8 * u, 2 * u);
      ctx.fill();
      this.roundRect(ctx, 3 * u, 12 * u - swing * 0.3, 6 * u, 8 * u, 2 * u);
      ctx.fill();
      return;
    }

    if (key === "crow") {
      const flap = Math.sin(t * 14) * 0.65;
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(-10 * u, 2 * u);
      ctx.lineTo(-24 * u, -6 * u);
      ctx.lineTo(-22 * u, 7 * u);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.ellipse(-1 * u, 2 * u, 15 * u, 11 * u, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(10 * u, -7 * u, 9 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.moveTo(18 * u, -10 * u);
      ctx.lineTo(27 * u, -6.5 * u);
      ctx.lineTo(18 * u, -3 * u);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(11.5 * u, -8.5 * u, 3 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(12.5 * u, -8.5 * u, 1.4 * u, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(-1 * u, -1 * u);
      ctx.rotate(flap);
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.ellipse(-3 * u, -5 * u, 11 * u, 5.5 * u, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (key === "mango") {
      const grad = ctx.createLinearGradient(-14 * u, -16 * u, 14 * u, 16 * u);
      grad.addColorStop(0, "#fb7185");
      grad.addColorStop(0.5, "#f97316");
      grad.addColorStop(1, "#facc15");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 2 * u, 14 * u, 18 * u, 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.ellipse(6 * u, -17 * u, 8 * u, 3.8 * u, -0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }

    if (key === "star" || key === "coin") {
      ctx.fillStyle = key === "star" ? "#facc15" : "#fbbf24";
      ctx.beginPath();
      const pts = key === "star" ? 10 : 24;
      for (let i = 0; i < pts; i++) {
        const rad = i % 2 === 0 ? 19 * u : key === "star" ? 8.5 * u : 16.5 * u;
        const ang = (i * Math.PI * 2) / pts - Math.PI / 2;
        const px = Math.cos(ang) * rad;
        const py = Math.sin(ang) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      return;
    }

    if (key === "gem") {
      ctx.fillStyle = "#06b6d4";
      ctx.beginPath();
      ctx.moveTo(0, -18 * u);
      ctx.lineTo(16 * u, -5 * u);
      ctx.lineTo(9 * u, 17 * u);
      ctx.lineTo(-9 * u, 17 * u);
      ctx.lineTo(-16 * u, -5 * u);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      return;
    }

    if (key === "laddoo") {
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(0, 0, 16 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fef08a";
      for (const [dx, dy] of [
        [-6, -5],
        [5, -4],
        [-2, 5],
        [7, 4],
      ]) {
        ctx.beginPath();
        ctx.arc(dx * u, dy * u, 1.6 * u, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    if (key === "meteor") {
      ctx.fillStyle = "rgba(251, 146, 60, 0.65)";
      ctx.beginPath();
      ctx.moveTo(-6 * u, -8 * u);
      ctx.lineTo(22 * u, -20 * u);
      ctx.lineTo(14 * u, 8 * u);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#7c2d12";
      ctx.beginPath();
      ctx.arc(-2 * u, 2 * u, 15 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }

    if (key === "cactus") {
      ctx.fillStyle = "#16a34a";
      this.roundRect(ctx, -6 * u, -17 * u, 12 * u, 34 * u, 6 * u);
      ctx.fill();
      ctx.stroke();
      this.roundRect(ctx, -16 * u, -6 * u, 10 * u, 6 * u, 3 * u);
      ctx.fill();
      ctx.stroke();
      this.roundRect(ctx, 6 * u, -2 * u, 10 * u, 6 * u, 3 * u);
      ctx.fill();
      ctx.stroke();
      return;
    }

    ctx.fillStyle = "#a855f7";
    ctx.beginPath();
    ctx.arc(0, 2 * u, 16 * u, Math.PI, 0);
    ctx.lineTo(17 * u, 13 * u);
    ctx.lineTo(-17 * u, 13 * u);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-5.5 * u, 3 * u, 3 * u, 0, Math.PI * 2);
    ctx.arc(5.5 * u, 3 * u, 3 * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(-5 * u, 3 * u, 1.4 * u, 0, Math.PI * 2);
    ctx.arc(6 * u, 3 * u, 1.4 * u, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHud(
    ctx: CanvasRenderingContext2D,
    blueprint: GameBlueprint,
    options: { score: number; lives: number; timeLeft: number | null }
  ): void {
    let xCursor = 16;
    const y = 14;

    if (blueprint.world.showScoreHud) {
      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
      this.roundRect(ctx, xCursor, y, 136, 38, 12);
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 16px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Score: ${options.score}`, xCursor + 14, y + 24);
      ctx.restore();
      xCursor += 148;
    }

    if (blueprint.world.showLivesHud) {
      const hearts = "♥".repeat(Math.max(0, Math.min(6, options.lives))) || "0";
      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
      this.roundRect(ctx, xCursor, y, 144, 38, 12);
      ctx.fill();
      ctx.font = "bold 16px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = "#fb7185";
      ctx.fillText(`Lives: ${hearts}`, xCursor + 14, y + 24);
      ctx.restore();
      xCursor += 156;
    }

    if (options.timeLeft !== null) {
      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
      this.roundRect(ctx, xCursor, y, 118, 38, 12);
      ctx.fill();
      ctx.font = "bold 16px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`Time: ${Math.ceil(Math.max(0, options.timeLeft))}s`, xCursor + 14, y + 24);
      ctx.restore();
    }
  }

  private drawEndBanner(ctx: CanvasRenderingContext2D, status: "won" | "lost", score: number): void {
    const w = CanvasRenderer.STAGE_WIDTH;
    const h = CanvasRenderer.STAGE_HEIGHT;
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
    ctx.fillRect(0, 0, w, h);

    const cardW = 360;
    const cardH = 156;
    const cx = (w - cardW) / 2;
    const cy = (h - cardH) / 2;

    ctx.fillStyle = "#ffffff";
    this.roundRect(ctx, cx, cy, cardW, cardH, 20);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.font = "bold 30px system-ui, sans-serif";
    ctx.fillStyle = status === "won" ? "#16a34a" : "#e11d48";
    ctx.fillText(status === "won" ? "You Win!" : "Game Over!", w / 2, cy + 58);

    ctx.font = "600 18px system-ui, sans-serif";
    ctx.fillStyle = "#334155";
    ctx.fillText(`Final Score: ${score}`, w / 2, cy + 96);

    ctx.font = "500 13px system-ui, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Click Restart below to play again", w / 2, cy + 128);
    ctx.restore();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
