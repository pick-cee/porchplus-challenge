import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { AppService } from "./app.service";
import { CreateMemberDto } from "./DTOS";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post("new-member")
    async registerMember(@Body() memberDto: CreateMemberDto) {
        return await this.appService.register(memberDto);
    }

    @Post("monthly-service")
    async monthlyService(@Query("membershipId") membershipId: string) {
        return await this.appService.createMonthlyMembership(membershipId);
    }

    @Get("invoice")
    async generateInvoice(@Query("membershipId") membershipId: string) {
        return await this.appService.generateInvoice(membershipId);
    }
}
