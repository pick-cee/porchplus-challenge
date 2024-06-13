import { Body, Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { CreateMemberDto } from "./DTOS";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Post('new-member')
    async registerMember(
        @Body() memberDto: CreateMemberDto
    ) {
        return await this.appService.register(memberDto);
    }
}
