import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ["error", "debug", "warn", "log"],
        cors: true,
    });

    const configSvc = app.get<ConfigService>(ConfigService);

    await app.listen(configSvc.get<number>("PORT"));
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
