export const MODE = {
    DEVELOPMENT_MODE: "DEVELOPMENT_MODE",
    PRODUCTION_MODE: "PRODUCTION_MODE"
} as const;

export type MODE_TYPE = keyof typeof MODE;

export const PLAN = {
    STARTER: "STARTER",
    BASIC: "BASIC",
    PRO: "PRO"
} as const;

export type PLAN_TYPE = keyof typeof PLAN;

export const BOT_TYPE = {
    DEMO: "DEMO",
    MULTIBOT: "MULTIBOT",
} as const;

export type BOT_TYPE_TYPE = keyof typeof BOT_TYPE;
