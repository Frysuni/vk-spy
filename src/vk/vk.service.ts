import { forwardRef, ForwardReference, Injectable, Inject } from "@nestjs/common";
import { ConfigService, ConfigType } from "@nestjs/config";
import { InjectVkApi } from "nestjs-vk";
import { MessageContext, VK } from "vk-io";
import { AllUsersFieldsConstant } from "./vk.constants";
import { VkConfig } from "./vk.config";
import { SuspectUserType } from "./types/suspectUser.type";
import { AppService } from "~/app.service";

@Injectable()
export class VkService {
  private readonly config = this.configService.get('vk', { infer: true });

  constructor(
    @Inject(forwardRef(() => AppService)) private readonly appService: AppService,
    @InjectVkApi() private readonly vk: VK,
    private readonly configService: ConfigService<ConfigType<typeof VkConfig>, true>,

  ) {}

  public async onMessage(ctx: MessageContext) {
    const sender = (await this.vk.api.users.get({ user_ids: [ctx.senderId], fields: [] }))[0] as SuspectUserType;

    this.appService.onVkMessage(`Мне написали!\nОт: ${sender.first_name} ${sender.last_name}\n"${ctx.text}"`);
  }

  public async getSuspectUser(): Promise<SuspectUserType> {
    const users = await this.vk.api.users.search({
      q: this.config.suspectUserSearchQuery,
      fields: AllUsersFieldsConstant,
    });
    return users.items[0] as SuspectUserType;

    // maybe make a normal functionality. receive videos, wall, photos, likes, etc.
  }
}
