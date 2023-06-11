import type { Telegraf } from "telegraf";

export type InputFile = Parameters<Telegraf['telegram']['sendDocument']>[1];