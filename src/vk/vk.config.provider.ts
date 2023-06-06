import { VkOptionsFactory, VkModuleOptions } from "nestjs-vk";
import { DirectAuthorization, officialAppCredentials } from "@vk-io/authorization";
import { CallbackService, CallbackServiceRetry, ICallbackServiceCaptchaPayload, ICallbackServiceTwoFactorPayload } from 'vk-io';
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService, ConfigType } from "@nestjs/config";
import { VkConfig } from "./vk.config";

@Injectable()
export class VkConfigProvider implements VkOptionsFactory {
  private readonly logger = new Logger(VkConfigProvider.name);
  private readonly config = this.configService.get('vk', { infer: true });

  constructor(
    private readonly configService: ConfigService<ConfigType<typeof VkConfig>, true>,
  ) {}

  public async createVkOptions(): Promise<VkModuleOptions> {
    const userAuthData = await this.userAuth();
    this.logger.log('VK logined successfully');
    return {
      token: userAuthData.token,
      options: {
        apiMode: 'sequential',
      },
    };
  }

  private userAuth() {
    const callbackService = new CallbackService();

    callbackService.onCaptcha(this.captchaHandler);
    callbackService.onTwoFactor(this.twoFactorHandler);

    const direct = new DirectAuthorization({
      apiVersion: '5.131',
      callbackService,
      ...officialAppCredentials.android,
      scope: 'all',
      login: this.config.login,
      password: this.config.password,
    });

    return direct.run();
  }

  private input(prompt: string): Promise<string> {
    const ansiColors = {
      boldWhite: '\x1b[1;37m',
      backgroundGreen: '\x1b[42m',
      reset: '\x1b[0m',
    };

    process.stdout.write(`${ansiColors.backgroundGreen}${ansiColors.boldWhite}${prompt}:${ansiColors.reset} `);

    const resolver = (resolve: (value: string | PromiseLike<string>) => void) => (data: Buffer) => resolve(data.toString().trim());
    return new Promise(resolve => process.stdin.on('data', resolver(resolve)));
  }

  private async captchaHandler(payload: ICallbackServiceCaptchaPayload, retry: CallbackServiceRetry): Promise<void> {
    const captchaPayload = await this.input(`Введите капчу из ссылки ${payload.src} `);
    return retry(captchaPayload);
  }

  private async twoFactorHandler(payload: ICallbackServiceTwoFactorPayload, retry: CallbackServiceRetry): Promise<void> {
    const twoFactorPayload = await this.input(`${payload.type?.toUpperCase()} code${payload.phoneMask ? ` - ${payload.phoneMask}` : ''}`);
    return retry(twoFactorPayload);
  }
}