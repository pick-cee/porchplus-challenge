import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleService } from './scheduler';
import { Membership, MEMBERSHIP_TYPE } from './schemas';
import { EmailService } from './email.service';
import { AppService } from './app.service';
import * as moment from 'moment';

describe('ScheduleService', () => {
    let service: ScheduleService;
    let membershipRepo: Repository<Membership>;
    let emailService: EmailService;
    let appService: AppService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ScheduleService,
                {
                    provide: getRepositoryToken(Membership),
                    useClass: Repository,
                },
                {
                    provide: EmailService,
                    useValue: {
                        sendFirstMonthRemider: jest.fn(),
                        sendMonthlyEmail: jest.fn(),
                        sendAnnualEmail: jest.fn(),
                    },
                },
                {
                    provide: AppService,
                    useValue: {
                        generateInvoice: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ScheduleService>(ScheduleService);
        membershipRepo = module.get<Repository<Membership>>(getRepositoryToken(Membership));
        emailService = module.get<EmailService>(EmailService);
        appService = module.get<AppService>(AppService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('handleCron', () => {
        it('should send first month reminder', async () => {
            const today = moment();
            const dueDate = today.clone().add(7, 'days');
            const membership = {
                id: '1',
                isFirstMonth: true,
                dueDate: dueDate.toDate(),
                member: { email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
                membershipType: MEMBERSHIP_TYPE.ANNUAL_BASIC,
            } as Membership;

            const invoice = { amount: 800 };

            jest.spyOn(membershipRepo, 'find').mockResolvedValue([membership]);
            jest.spyOn(appService, 'generateInvoice').mockResolvedValue(invoice as any);

            await service.handleCron();

            expect(appService.generateInvoice).toHaveBeenCalledWith(membership.id);
            expect(emailService.sendFirstMonthRemider).toHaveBeenCalledWith({
                dueAmount: invoice.amount,
                email: membership.member.email,
                firstName: membership.member.firstName,
                lastName: membership.member.lastName,
                invoice: invoice,
                membershipType: membership.membershipType,
            });
        });

        it('should send monthly email', async () => {
            const today = moment();
            const membership = {
                id: '1',
                isFirstMonth: false,
                monthlyDueDate: today.toDate(),
                member: { email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
                membershipType: MEMBERSHIP_TYPE.MONTHLY_PREMIUM,
                monthlyAmount: 300,
            } as Membership;

            const invoice = { amount: 300 };

            jest.spyOn(membershipRepo, 'find').mockResolvedValue([membership]);
            jest.spyOn(appService, 'generateInvoice').mockResolvedValue(invoice as any);

            await service.handleCron();

            expect(appService.generateInvoice).toHaveBeenCalledWith(membership.id);
            expect(emailService.sendMonthlyEmail).toHaveBeenCalledWith({
                dueDate: membership.monthlyDueDate,
                email: membership.member.email,
                firstName: membership.member.firstName,
                lastName: membership.member.lastName,
                invoice: invoice,
                membershipType: membership.membershipType,
                monthlyAmount: membership.monthlyAmount,
            });
        });

        it('should send annual email', async () => {
            const today = moment();
            const dueDate = today.clone().add(7, 'days');
            const membership = {
                id: '1',
                isFirstMonth: false,
                dueDate: dueDate.toDate(),
                member: { email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
                membershipType: MEMBERSHIP_TYPE.ANNUAL_BASIC,
            } as Membership;

            const invoice = { amount: 500 };

            jest.spyOn(membershipRepo, 'find').mockResolvedValue([membership]);
            jest.spyOn(appService, 'generateInvoice').mockResolvedValue(invoice as any);

            await service.handleCron();

            expect(appService.generateInvoice).toHaveBeenCalledWith(membership.id);
            expect(emailService.sendAnnualEmail).toHaveBeenCalledWith({
                dueDate: membership.dueDate,
                email: membership.member.email,
                firstName: membership.member.firstName,
                lastName: membership.member.lastName,
                totalAmount: invoice.amount,
                invoice: invoice,
                mebershipType: membership.membershipType,
            });
        });

        it('should not send any email if conditions are not met', async () => {
            const today = moment();
            const dueDate = today.clone().add(30, 'days');
            const membership = {
                id: '1',
                isFirstMonth: false,
                dueDate: dueDate.toDate(),
                member: { email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
                membershipType: MEMBERSHIP_TYPE.ANNUAL_BASIC,
            } as Membership;

            const invoice = { amount: 500 };

            jest.spyOn(membershipRepo, 'find').mockResolvedValue([membership]);
            jest.spyOn(appService, 'generateInvoice').mockResolvedValue(invoice as any);

            await service.handleCron();

            expect(appService.generateInvoice).toHaveBeenCalledWith(membership.id);
            expect(emailService.sendFirstMonthRemider).not.toHaveBeenCalled();
            expect(emailService.sendMonthlyEmail).not.toHaveBeenCalled();
            expect(emailService.sendAnnualEmail).not.toHaveBeenCalled();
        });
    });
});