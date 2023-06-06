import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { TgConfig } from './tg.config';
import { TgConfigProvider } from './tg.config.provider';
import { TgService } from './tg.service';
import { TgUpdate } from './tg.update';
import { AppModule } from '~/app.module';

@Module({
  imports: [
    ConfigModule.forFeature(TgConfig),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TgConfigProvider,
    }),
    forwardRef(() => AppModule),
  ],
  providers: [
    TgUpdate,
    TgService,
  ],
  exports: [
    TgService,
  ],
})
export class TgModule {}