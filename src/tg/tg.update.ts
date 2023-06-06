import { Ctx, Hears, Help, On, Start, Update } from "nestjs-telegraf";
import { TgService } from "./tg.service";
import { TextMessageContext } from "./types/textMessageContext.type";
import { AppService } from "~/app.service";

@Update()
export class TgUpdate {
  constructor(
    private readonly appService: AppService,
    private readonly tgService: TgService,
  ) {}

  @Start()
  private async start(@Ctx() ctx: TextMessageContext): Promise<string | void> {
    return this.tgService.start(ctx);
  }

  @Help()
  private async help(@Ctx() ctx: TextMessageContext): Promise<string | void> {
    return this.tgService.help(ctx);
  }

  @Hears('/chart')
  private async chart(@Ctx() ctx: TextMessageContext): Promise<string | void> {
    return this.appService.chartCommand(ctx);
  }

  @On('message')
  private async onMessage(@Ctx() ctx: TextMessageContext): Promise<string | void> {
    return this.tgService.onMessage(ctx);
  }
}