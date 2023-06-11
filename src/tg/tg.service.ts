import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService, ConfigType } from "@nestjs/config";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { TgConfig } from "./tg.config";
import { TextMessageContext } from "./types/textMessageContext.type";
import { InputFile } from "./types/inputFile.type";

@Injectable()
export class TgService implements OnApplicationBootstrap {
  private readonly config = this.configService.get('tg', { infer: true });
  private readonly pathToFile = resolve(__dirname, '../', '../', '.adminChatId');
  private readonly specialChars = ['\\', '_', '*', '[', ']', '(', ')', '~', '`', '>', '<', '&', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
  private adminChatId: number | undefined = existsSync(this.pathToFile) ? Number(readFileSync(this.pathToFile).toString()) : undefined;

  constructor(
    @InjectBot() private readonly tg: Telegraf,
    private readonly configService: ConfigService<ConfigType<typeof TgConfig>, true>,
  ) {}

  public onApplicationBootstrap() {
    this.sendMessageToAdmin('Я запущен.');
  }

  public async start(ctx: TextMessageContext): Promise<string | void> {
    if (ctx.message.from.username !== this.config.adminUsername) return 'Unauthorized.';
    writeFileSync(this.pathToFile, String(ctx.message.from.id));
    this.adminChatId = ctx.message.from.id;

    return 'Все идет по плану.';
  }

  public async help(ctx: TextMessageContext): Promise<string | void> {
    if (ctx.message.from.username !== this.config.adminUsername) return 'Unauthorized.';
    return 'Все идет по плану.';
  }

  public async onMessage(ctx: TextMessageContext): Promise<string | void> {
    if (ctx.message.from.username !== this.config.adminUsername) {
      const from = ctx.message.from;
      this.sendMessageToAdmin(`Мне пишет какой-то додик в тг\n${from.username} (${from.first_name} ${from.last_name})\n"${ctx.message.text}"`);
    }
  }

  public sendMessageToAdmin(message: string) {
    if (!this.adminChatId) return;
    return this.tg.telegram.sendMessage(
      this.adminChatId,
      this.escapeMarkdown(message),
      { parse_mode: 'MarkdownV2' },
    ).catch(() => {});
  }

  public sendDocumentToAdmin(document: InputFile, caption?: string) {
    if (!this.adminChatId) return;
    return this.tg.telegram.sendDocument(
      this.adminChatId,
      document,
      {
        parse_mode: 'MarkdownV2',
        caption: caption ? this.escapeMarkdown(caption) : undefined,
      },
    );
  }

  public editMessageText(messageId: number | string, text: string) {
    if (!this.adminChatId) return;
    return this.tg.telegram.editMessageText(
      this.adminChatId,
      Number(messageId),
      undefined,
      this.escapeMarkdown(text),
      { parse_mode: 'MarkdownV2' },
    );
  }

  public deleteMessage(messageId: number | string) {
    if (!this.adminChatId) return;
    return this.tg.telegram.deleteMessage(this.adminChatId, Number(messageId)).catch(() => {});
  }

  public escapeMarkdown(text: string) {
    const replaceAll = (input: string, searchValue: string, replaceValue = '') => input.split(searchValue).join(replaceValue);

    this.specialChars.forEach(specialChar =>
      text = replaceAll(text, specialChar, `\\${specialChar}`),
    );
    return text;
  }
}