export type BehaviorType =
  | "player_horizontal"
  | "player_4way"
  | "player_platformer"
  | "patrol_horizontal"
  | "patrol_vertical"
  | "spawn_and_fall"
  | "float_random"
  | "chase_target"
  | "straight_line_to_target"
  | "static";

export type TriggerType =
  | "on_collide"
  | "on_tap_or_space"
  | "on_score_reach"
  | "on_lives_zero"
  | "on_timer_end";

export type ActionType =
  | "add_score"
  | "lose_life"
  | "gain_life"
  | "destroy_target"
  | "respawn_source"
  | "bounce_source"
  | "change_speed"
  | "play_sfx"
  | "win_game"
  | "lose_game";

export type SfxKey = "pop" | "jump" | "coin" | "bonk" | "win" | "lose";

export interface GameEntity {
  id: string;
  name: string;
  spriteKey: string;
  x: number;
  y: number;
  scale: number;
  flipX: boolean;
  logicPrompt?: string;
  behavior: {
    type: BehaviorType;
    speed: number;
    jumpForce?: number;
    spawnIntervalSec?: number;
    targetId?: string;
  };
}

export interface GameRule {
  id: string;
  enabled: boolean;
  summaryEn: string;
  summaryHi: string;
  trigger: {
    type: TriggerType;
    sourceId?: string;
    targetId?: string;
    threshold?: number;
  };
  actions: Array<{
    type: ActionType;
    value?: number;
    sfx?: SfxKey;
  }>;
}

export interface GameBlueprint {
  version: "1.0";
  title: string;
  world: {
    backdropKey: string;
    gravity: number;
    initialScore: number;
    initialLives: number;
    timerSeconds: number | null;
    showScoreHud: boolean;
    showLivesHud: boolean;
  };
  entities: GameEntity[];
  rules: GameRule[];
  coachingTip?: string;
}

export interface PromptInputs {
  gameIdea: string;
  movement: string;
  interactions: string;
  scoring: string;
  stopPoint: string;
}
