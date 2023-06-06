import { Ctx, HearFallback, Update, Message } from "nestjs-vk";
import { MessageContext } from "vk-io";
import { VkService } from "./vk.service";

@Update()
export class VkUpdate {

  constructor(
    private readonly vkService: VkService,
  ) {}

  @HearFallback()
  private onMessage(@Ctx() ctx: MessageContext) {
    if (!ctx.text) return;
    this.vkService.onMessage(ctx);
  }
}