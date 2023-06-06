import type { Context } from "telegraf";
import type { Message, Update } from "telegraf/types";

export type TextMessageContext = Context<Update.MessageUpdate<Message.TextMessage>>