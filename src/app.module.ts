import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AppService } from "./app.service";
import { AppUtils } from "./app.utils";
import { ChartModule } from "./chart/chart.module";
import { TgModule } from "./tg/tg.module";
import { VkModule } from "./vk/vk.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
    ScheduleModule.forRoot(),
    forwardRef(() => VkModule),
    forwardRef(() => TgModule),
    ChartModule,
  ],
  providers: [
    AppService,
    AppUtils,
  ],
  exports: [
    AppService,
  ],
})
export class AppModule {}