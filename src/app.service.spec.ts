import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppService } from './app.service';
import { Invoice, MEMBERSHIP_TYPE, Member, Membership } from './schemas';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateMemberDto } from './DTOS';

describe('AppService', () => {
    let service: AppService;
    let memberRepo: Repository<Member>;
    let membershipRepo: Repository<Membership>;
    let invoiceRepo: Repository<Invoice>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppService,
                {
                    provide: getRepositoryToken(Member),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Membership),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Invoice),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<AppService>(AppService);
        memberRepo = module.get<Repository<Member>>(getRepositoryToken(Member));
        membershipRepo = module.get<Repository<Membership>>(getRepositoryToken(Membership));
        invoiceRepo = module.get<Repository<Invoice>>(getRepositoryToken(Invoice));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        it('should create a new member and membership', async () => {
            const createMemberDto: CreateMemberDto = {
                email: 'test@example.com',
                firstName: 'Test User',
                lastName: '2024'
            };
            const savedMember = { id: '1', ...createMemberDto };

            jest.spyOn(memberRepo, 'findOne').mockResolvedValue(null);
            jest.spyOn(memberRepo, 'create').mockReturnValue(savedMember as Member);
            jest.spyOn(memberRepo, 'save').mockResolvedValue(savedMember as Member);
            jest.spyOn(membershipRepo, 'create').mockReturnValue({} as Membership);
            jest.spyOn(membershipRepo, 'save').mockResolvedValue({} as Membership);

            const result = await service.register(createMemberDto);

            expect(result).toEqual(savedMember);
            expect(memberRepo.create).toHaveBeenCalledWith(createMemberDto);
            expect(memberRepo.save).toHaveBeenCalled();
            expect(membershipRepo.create).toHaveBeenCalled();
            expect(membershipRepo.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException if user already exists', async () => {
            const createMemberDto: CreateMemberDto = {
                email: 'existing@example.com', firstName: 'Existing User', lastName: '2024'
            };

            jest.spyOn(memberRepo, 'findOne').mockResolvedValue({} as Member);

            await expect(service.register(createMemberDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('createMonthlyMembership', () => {
        it('should update membership to monthly premium', async () => {
            const membershipId = '1';
            const existingMembership = {
                id: membershipId,
                startDate: new Date(),
                member: { id: '1' },
            } as Membership;

            jest.spyOn(membershipRepo, 'findOne').mockResolvedValue(existingMembership);
            jest.spyOn(membershipRepo, 'count').mockResolvedValue(0);
            jest.spyOn(membershipRepo, 'update').mockResolvedValue({ affected: 1 } as any);

            const result = await service.createMonthlyMembership(membershipId);

            expect(result).toEqual({ affected: 1 });
            expect(membershipRepo.update).toHaveBeenCalledWith(
                { id: membershipId },
                expect.objectContaining({
                    monthlyAmount: 300,
                    isFirstMonth: true,
                    membershipType: MEMBERSHIP_TYPE.MONTHLY_PREMIUM,
                }),
            );
        });

        it('should throw NotFoundException if membership does not exist', async () => {
            jest.spyOn(membershipRepo, 'findOne').mockResolvedValue(null);

            await expect(service.createMonthlyMembership('non-existent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('generateInvoice', () => {
        it('should generate an invoice for first month membership', async () => {
            const membershipId = '1';
            const membership = {
                id: membershipId,
                isFirstMonth: true,
                totalAmount: 500,
                monthlyAmount: 300,
            } as Membership;

            jest.spyOn(membershipRepo, 'findOne').mockResolvedValue(membership);
            jest.spyOn(membershipRepo, 'save').mockResolvedValue(membership);
            jest.spyOn(invoiceRepo, 'create').mockReturnValue({} as Invoice);
            jest.spyOn(invoiceRepo, 'save').mockResolvedValue({} as Invoice);

            await service.generateInvoice(membershipId);

            expect(invoiceRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    amount: 800,
                    membership,
                }),
            );
            expect(invoiceRepo.save).toHaveBeenCalled();
            expect(membership.isFirstMonth).toBe(false);
        });

        it('should generate an invoice for monthly membership', async () => {
            const membershipId = '1';
            const membership = {
                id: membershipId,
                isFirstMonth: false,
                monthlyAmount: 300,
            } as Membership;

            jest.spyOn(membershipRepo, 'findOne').mockResolvedValue(membership);
            jest.spyOn(invoiceRepo, 'create').mockReturnValue({} as Invoice);
            jest.spyOn(invoiceRepo, 'save').mockResolvedValue({} as Invoice);

            await service.generateInvoice(membershipId);

            expect(invoiceRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    amount: 300,
                    membership,
                }),
            );
            expect(invoiceRepo.save).toHaveBeenCalled();
        });

        it('should generate an invoice for yearly membership', async () => {
            const membershipId = '1';
            const membership = {
                id: membershipId,
                isFirstMonth: false,
                totalAmount: 500,
            } as Membership;

            jest.spyOn(membershipRepo, 'findOne').mockResolvedValue(membership);
            jest.spyOn(invoiceRepo, 'create').mockReturnValue({} as Invoice);
            jest.spyOn(invoiceRepo, 'save').mockResolvedValue({} as Invoice);

            await service.generateInvoice(membershipId);

            expect(invoiceRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    amount: 500,
                    membership,
                }),
            );
            expect(invoiceRepo.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException if membership does not exist', async () => {
            jest.spyOn(membershipRepo, 'findOne').mockResolvedValue(null);

            await expect(service.generateInvoice('non-existent')).rejects.toThrow(NotFoundException);
        });
    });
});