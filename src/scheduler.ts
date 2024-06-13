import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Membership } from "./schemas";
import { Repository } from "typeorm";
import { EmailSevice } from "./email.service";
import { AppService } from "./app.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import * as moment from "moment";

@Injectable()
export class ScheduleService {
    private logger = new Logger(ScheduleService.name);

    constructor(
        @InjectRepository(Membership)
        private membershipRepo: Repository<Membership>,
        private emailSvc: EmailSevice,
        private invoiceSvc: AppService,
    ) {}

    @Cron(CronExpression.EVERY_30_SECONDS)
    async handleCron() {
        this.logger.log(`Running daily membersip fee reminder cron job`);

        const memberships = await this.membershipRepo.find({
            relations: ["member"],
        });

        memberships.forEach(async (membership) => {
            const today = moment();
            const reminderDate = moment(membership.dueDate).subtract(7, "days");

            // this generates the invoice for the member and changes the isFirstMonth to false if set to true before
            const invoice = await this.invoiceSvc.generateInvoice(
                membership.id,
            );

            // this checks if it is firstMonth and if today is the same as the reminder date and sends the reminder
            if (membership.isFirstMonth && today.isSame(reminderDate, "day")) {
                await this.emailSvc.sendFirstMonthRemider({
                    dueAmount: invoice.amount,
                    email: membership.member.email,
                    firstName: membership.member.firstName,
                    lastName: membership.member.lastName,
                    invoice: invoice,
                    membershipType: membership.membershipType,
                });
            }

            // this checks for monthly payments that is not first month and sends the reminder
            else if (
                !membership.isFirstMonth &&
                membership.monthlyDueDate &&
                today.isSame(membership.monthlyDueDate, "day")
            ) {
                await this.emailSvc.sendMonthlyEmail({
                    dueDate: membership.monthlyDueDate,
                    email: membership.member.email,
                    firstName: membership.member.firstName,
                    lastName: membership.member.lastName,
                    invoice: invoice,
                    membershipType: membership.membershipType,
                    monthlyAmount: membership.monthlyAmount,
                });
            }

            // this checks for just annual payments and sends the reminder
            else if (
                !membership.isFirstMonth &&
                today.isSame(reminderDate, "day")
            ) {
                await this.emailSvc.sendAnnualEmail({
                    dueDate: membership.dueDate,
                    email: membership.member.email,
                    firstName: membership.member.firstName,
                    lastName: membership.member.lastName,
                    totalAmount: invoice.amount,
                    invoice: invoice,
                    mebershipType: membership.membershipType,
                });
            }
        });
    }
}
