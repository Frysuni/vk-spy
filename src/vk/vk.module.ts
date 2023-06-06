import { forwardRef, Module } from "@nestjs/common";
import { VkModule as VkCoreModule } from "nestjs-vk";
import { ConfigModule } from '@nestjs/config';
import { VkService } from "./vk.service";
import { VkConfig } from "./vk.config";
import { VkConfigProvider } from "./vk.config.provider";
import { VkUpdate } from "./vk.update";
import { AppModule } from "~/app.module";


@Module({
  imports: [
    ConfigModule.forFeature(VkConfig),
    VkCoreModule.forRootAsync({
      imports: [ConfigModule],
      useClass: VkConfigProvider,
    }),
    forwardRef(() => AppModule),
  ],
  providers: [
    VkService,
    VkUpdate,
  ],
  exports: [
    VkService,
  ],
})
export class VkModule {}