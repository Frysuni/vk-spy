import { Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { TelegrafModuleOptions, TelegrafOptionsFactory } from 'nestjs-telegraf';
import { TgConfig } from './tg.config';

@Injectable()
export class TgConfigProvider implements TelegrafOptionsFactory {
  private readonly config = this.configService.get('tg', { infer: true });

  constructor(
    private readonly configService: ConfigService<ConfigType<typeof TgConfig>, true>,
  ) {}

  createTelegrafOptions(): Promise<TelegrafModuleOptions> | TelegrafModuleOptions {
    return {
      token: this.config.token,
    };
  }
}