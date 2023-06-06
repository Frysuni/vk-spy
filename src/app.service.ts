import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression  } from "@nestjs/schedule";
import svg2img from 'svg2img';
import { TgService } from "./tg/tg.service";
import { VkService } from "./vk/vk.service";
import { AppUtils } from "./app.utils";
import { SuspectUserType } from "./vk/types/suspectUser.type";
import { TextMessageContext } from "./tg/types/textMessageContext.type";
import { ChartService } from "./chart/chart.service";
@Injectable()
export class AppService {
  private readonly pathToData = resolve(__dirname, '../', '.data');

  constructor(
    private readonly vkService: VkService,
    private readonly tgService: TgService,
    private readonly appUtils:  AppUtils,
    private readonly chartService: ChartService,
  ) {}

  public async onModuleInit() {
    if (!existsSync(this.pathToData)) writeFileSync(this.pathToData, JSON.stringify(await this.vkService.getSuspectUser()));
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async updater() {
    const actualSuspectUser = await this.vkService.getSuspectUser();
    const cachedSuspectUser = JSON.parse(readFileSync(this.pathToData).toString()) as SuspectUserType;

    this.collectOnlineInfo(Boolean(actualSuspectUser.online));

    const differences = this.appUtils.findDifferences(cachedSuspectUser, actualSuspectUser);
    if (differences.length == 0) return;

    writeFileSync(this.pathToData, JSON.stringify(actualSuspectUser));
    this.tgService.sendToAdmin(`Обновление!\n\n${differences.join('\n')}`);
  }

  private async collectOnlineInfo(isOnline: boolean) {
    const dateString = new Date().toISOString();
    const dataString = `${dateString}=${isOnline ? 1 : 0}|`;
    const pathToFile = resolve(__dirname, '../', '.chartData');

    if (!existsSync(pathToFile)) writeFileSync(pathToFile, '');
    appendFileSync(pathToFile, dataString);
  }

  public async onVkMessage(preparedText: string) {
    return this.tgService.sendToAdmin(preparedText);
  }

  public async chartCommand(ctx: TextMessageContext) {
    const chatId = ctx.chat.id;
    const { message_id } = await ctx.telegram.sendMessage(ctx.chat.id, this.appUtils.escapeMarkdown('Создаю график, подождите...'));

    const startTime = Date.now();
    const { datasetReaded, datasetSize } = this.chartService.createChart(whenDone.bind(this));

    async function whenDone(this: AppService, image: Buffer) {
      clearInterval(updateMessageInterval);

      image = await this.appUtils.svg2img(image);

      ctx.telegram.deleteMessage(chatId, message_id);

      ctx.telegram.sendDocument(
        chatId,
        {
          source: image,
          filename: 'frys-bot-chart.png',
        },
        {
          parse_mode: 'MarkdownV2',
          caption: this.appUtils.escapeMarkdown(
            `График активности готов.\n` +
            `Времени затрачено: ${this.appUtils.formatTime((Date.now() - startTime) / 60 / 1000)}\n` +
            `На основе базы данных за ${this.appUtils.formatTime(datasetSize)}`,
          ),
        },
      );

    }

    const updateMessageInterval = setInterval(() => {
      const readed = datasetReaded();
      const percentage = ~~(readed / datasetSize * 100);

      const progressInMinutes = (Date.now() - startTime) / 60 / 1000;
      const estimatedTotalMinutes = (datasetSize / readed) * progressInMinutes;
      const estimatedRemainingMinutes = estimatedTotalMinutes - progressInMinutes;

      const estimatedRemainingTime = this.appUtils.formatTime(estimatedRemainingMinutes);

      ctx.telegram.editMessageText(
        chatId,
        message_id,
        undefined,
        this.appUtils.escapeMarkdown(`${readed}/${datasetSize} (${percentage}%)\nОсталось: ${estimatedRemainingTime}`),
        { parse_mode: 'MarkdownV2' },
      );
    }, 3000);

  }
}