import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Novu } from "@novu/node";
import { AnnualEmailDto, FirstMonthReminderDto, MonthlyEmailDto } from "./DTOS";

@Injectable()
export class EmailService {
    private novu: Novu;
    private logger = new Logger(EmailService.name);
    constructor(private readonly configSvc: ConfigService) {
        this.novu = new Novu(this.configSvc.get<string>("NOVU_API_KEY"));
    }

    private async sendEmail(
        template: string,
        emailData: any,
        logMessage: string,
    ) {
        try {
            if (!emailData) {
                throw new BadRequestException(
                    "Please fill the data to send this email",
                );
            }

            await this.novu.trigger(template, {
                to: {
                    subscriberId: emailData.email,
                    email: emailData.email,
                },
                payload: emailData,
            });

            this.logger.log(`${logMessage} ${emailData.email}`);
            return {
                message: "Email has been sent successfully",
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            } else {
                throw new InternalServerErrorException(error.message);
            }
        }
    }

    async sendAnnualEmail(annaulDto: AnnualEmailDto) {
        const invoiceDetails = `
            Amount: ${annaulDto.invoice.amount},
            Issue Date: ${annaulDto.invoice.issueDate.toDateString()}
        `;
        return this.sendEmail(
            "annual-membership",
            {
                membershipType: annaulDto.mebershipType,
                firstName: annaulDto.firstName,
                lastName: annaulDto.lastName,
                email: annaulDto.email,
                totalAmount: annaulDto.totalAmount,
                dueDate: annaulDto.dueDate.toDateString(),
                invoice: invoiceDetails,
            },
            "Annual reminder email has been sent to",
        );
    }

    async sendFirstMonthRemider(firstMonthDto: FirstMonthReminderDto) {
        const invoiceDetails = `
            Amount: ${firstMonthDto.invoice.amount},
            Issue Date: ${firstMonthDto.invoice.issueDate.toDateString()}
        `;
        return this.sendEmail(
            "first-month-reminder",
            {
                membershipType: firstMonthDto.membershipType,
                firstName: firstMonthDto.firstName,
                lastName: firstMonthDto.lastName,
                email: firstMonthDto.email,
                dueAmount: firstMonthDto.dueAmount,
                invoice: invoiceDetails,
            },
            "First month reminder email has been sent to",
        );
    }

    async sendMonthlyEmail(monthlyEmail: MonthlyEmailDto) {
        const invoiceDetails = `
            Amount: ${monthlyEmail.invoice.amount},
            Issue Date: ${monthlyEmail.invoice.issueDate.toDateString()}
        `;
        return this.sendEmail(
            "monthly-reminder",
            {
                membershipType: monthlyEmail.membershipType,
                email: monthlyEmail.email,
                firstName: monthlyEmail.firstName,
                lastName: monthlyEmail.lastName,
                monthlyAmount: monthlyEmail.monthlyAmount,
                dueDate: monthlyEmail.dueDate.toDateString(),
                invoice: invoiceDetails,
            },
            "Monthly reminder email has been sent to",
        );
    }
}
