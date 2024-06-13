import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AnnualEmailDto, FirstMonthReminderDto, MonthlyEmailDto } from './DTOS';
import { MEMBERSHIP_TYPE } from './schemas';


/**
 * Some notes on the implementation:

1.   We're mocking the Novu library to avoid making actual API calls during tests. 
    The mock simply resolves the trigger method without doing anything.

2.  We're providing a mock ConfigService that returns a fake API key.

3.  For each email sending method (sendAnnualEmail, sendFirstMonthRemider, sendMonthlyEmail), 
    we're checking that they return an object with a message property indicating success.
*/

// Mock Novu
jest.mock('@novu/node', () => {
    return {
        Novu: jest.fn().mockImplementation(() => ({
            trigger: jest.fn().mockResolvedValue(undefined),
        })),
    };
});

describe('EmailService', () => {
    let service: EmailService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('fake-api-key'),
                    },
                },
            ],
        }).compile();

        service = module.get<EmailService>(EmailService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendAnnualEmail', () => {
        it('should send an annual email successfully', async () => {
            const dto: AnnualEmailDto = {
                mebershipType: MEMBERSHIP_TYPE.ANNUAL_BASIC,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                totalAmount: 500,
                dueDate: new Date('2024-06-13'),
                invoice: { amount: 500, issueDate: new Date('2024-06-13') },
            };

            const result = await service.sendAnnualEmail(dto);
            expect(result.message).toBe('Email has been sent successfully');
        });
    });

    describe('sendFirstMonthRemider', () => {
        it('should send a first month reminder successfully', async () => {
            const dto: FirstMonthReminderDto = {
                membershipType: MEMBERSHIP_TYPE.MONTHLY_PREMIUM,
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane@example.com',
                dueAmount: 50,
                invoice: { amount: 50, issueDate: new Date('2024-06-13') },
            };

            const result = await service.sendFirstMonthRemider(dto);
            expect(result.message).toBe('Email has been sent successfully');
        });
    });

    describe('sendMonthlyEmail', () => {
        it('should send a monthly email successfully', async () => {
            const dto: MonthlyEmailDto = {
                membershipType: MEMBERSHIP_TYPE.MONTHLY_PREMIUM,
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice@example.com',
                monthlyAmount: 30,
                dueDate: new Date('2024-06-13'),
                invoice: { amount: 30, issueDate: new Date('2024-06-13') },
            };

            const result = await service.sendMonthlyEmail(dto);
            expect(result.message).toBe('Email has been sent successfully');
        });
    });

    describe('error handling', () => {
        it('should throw BadRequestException if emailData is not provided', async () => {
            await expect(service['sendEmail']('template', null, 'log message')).rejects.toThrow(BadRequestException);
        });

        it('should throw InternalServerErrorException if Novu throws an error', async () => {
            jest.spyOn(service['novu'], 'trigger').mockRejectedValueOnce(new Error('Novu error'));
            const dto: AnnualEmailDto = {
                mebershipType: MEMBERSHIP_TYPE.ANNUAL_BASIC,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                totalAmount: 500,
                dueDate: new Date('2023-12-31'),
                invoice: { amount: 500, issueDate: new Date('2023-01-01') },
            };

            await expect(service.sendAnnualEmail(dto)).rejects.toThrow(InternalServerErrorException);
        });
    });
});