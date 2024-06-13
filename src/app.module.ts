import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Invoice, Member, Membership } from "./schemas";
import { EmailSevice } from "./email.service";
import { ScheduleService } from "./scheduler";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ".env",
            validationSchema: Joi.object({
                PORT: Joi.number().required(),
                POSTGRES_HOST: Joi.string().required(),
                POSTGRES_USERNAME: Joi.string().required(),
                POSTGRES_PASSWORD: Joi.string().required(),
                POSTGRES_DATABASE: Joi.string().required(),
                NOVU_API_KEY: Joi.string().required(),
            }),
        }),
        TypeOrmModule.forRootAsync({
            useFactory: (configSvc: ConfigService) => ({
                type: "postgres",
                host: configSvc.get<string>("POSTGRES_HOST"),
                username: configSvc.get<string>("POSTGRES_USERNAME"),
                password: configSvc.get<string>("POSTGRES_PASSWORD"),
                database: configSvc.get<string>("POSTGRES_DATABASE"),
                autoLoadEntities: true,
                synchronize: true,
                entities: [Member, Membership, Invoice],
                logging: ["info", "error", "schema"],
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Member, Membership, Invoice]),
        ScheduleModule.forRoot(),
    ],
    controllers: [AppController],
    providers: [AppService, EmailSevice, ScheduleService],
})
export class AppModule {}
