import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService, ConfigType } from "@nestjs/config";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { TgConfig } from "./tg.config";
import { TextMessageContext } from "./types/textMessageContext.type";

@Injectable()
export class TgService implements OnApplicationBootstrap {
  private readonly config = this.configService.get('tg', { infer: true });
  private readonly pathToFile = resolve(__dirname, '../', '../', '.adminChatId');

  constructor(
    @InjectBot() private readonly tg: Telegraf,
    private readonly configService: ConfigService<ConfigType<typeof TgConfig>, true>,
  ) {}

  public onApplicationBootstrap() {
    this.sendToAdmin('Я запущен.');
  }

  public async start(ctx: TextMessageContext): Promise<string | void> {
    if (ctx.message.from.username !== this.config.adminUsername) return 'Unauthorized.';
    writeFileSync(this.pathToFile, String(ctx.message.from.id));
    return 'Все идет по плану.';
  }

  public async help(ctx: TextMessageContext): Promise<string | void> {
    if (ctx.message.from.username !== this.config.adminUsername) return 'Unauthorized.';
    return 'Все идет по плану.';
  }

  public async onMessage(ctx: TextMessageContext): Promise<string | void> {
    if (ctx.message.from.username !== this.config.adminUsername) {
      const from = ctx.message.from;
      this.sendToAdmin(`Мне пишет какой-то додик в тг\n${from.username} (${from.first_name} ${from.last_name})\n"${ctx.message.text}"`);
    }
  }

  public async sendToAdmin(message: string) {
    const chatId = Number(readFileSync(this.pathToFile).toString());
    return this.tg.telegram.sendMessage(chatId, message);
  }
}