import { NestFactory  } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ConsoleLogger, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

void async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.createApplicationContext(AppModule);

  app.enableShutdownHooks();

  await app.init();

  logger.log('Application is started');
}();