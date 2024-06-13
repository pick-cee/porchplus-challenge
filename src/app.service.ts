import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Invoice, MEMBERSHIP_TYPE, Member, Membership } from "./schemas";
import { IsNull, Not, Repository, UpdateResult } from "typeorm";
import { CreateMemberDto } from "./DTOS";

@Injectable()
export class AppService {
    constructor(
        @InjectRepository(Member) private memberRepo: Repository<Member>,
        @InjectRepository(Membership)
        private membershipRepo: Repository<Membership>,
        @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    ) {}

    async register(memberDto: CreateMemberDto): Promise<Member> {
        try {
            const memberExists = await this.memberRepo.findOne({
                where: { email: memberDto.email },
            });
            if (memberExists) {
                throw new BadRequestException("User already exists");
            }
            const newMemeber = this.memberRepo.create(memberDto);
            const savedMember = await this.memberRepo.save(newMemeber);
            const startDate = new Date();
            const newMembership = this.membershipRepo.create({
                member: { id: savedMember.id },
                startDate: startDate,
                dueDate: new Date(
                    startDate.getFullYear() + 1,
                    startDate.getMonth(),
                    startDate.getDate(),
                ),
                totalAmount: 500,
                isFirstMonth: false,
            });
            await this.membershipRepo.save(newMembership);
            return savedMember;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            } else {
                throw new InternalServerErrorException(error.message);
            }
        }
    }

    async createMonthlyMembership(
        membershipId: string,
    ): Promise<Membership | UpdateResult> {
        try {
            const membershipExists = await this.membershipRepo.findOne({
                where: { id: membershipId },
                relations: ["member"],
            });
            if (!membershipExists) {
                throw new NotFoundException("Create a membership first");
            }

            // check if this is the first ever montly service for the meber
            const existingMonthlyService = await this.membershipRepo.count({
                where: {
                    member: { id: membershipExists.member.id },
                    monthlyAmount: Not(IsNull()),
                },
            });
            const isFirstMonth = existingMonthlyService === 0;
            const updateMembership = await this.membershipRepo.update(
                { id: membershipId },
                {
                    monthlyAmount: 300,
                    monthlyDueDate: new Date(
                        membershipExists.startDate.getFullYear(),
                        membershipExists.startDate.getMonth() + 1,
                        membershipExists.startDate.getDate(),
                    ),
                    isFirstMonth: isFirstMonth,
                    membershipType: MEMBERSHIP_TYPE.MONTHLY_PREMIUM,
                },
            );
            return updateMembership;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            } else {
                throw new InternalServerErrorException(error.message);
            }
        }
    }

    async generateInvoice(membershipId: string): Promise<Invoice> {
        try {
            const membership = await this.membershipRepo.findOne({
                where: { id: membershipId },
            });
            if (!membership) {
                throw new NotFoundException("Membership not found");
            }

            let amount: number;
            if (membership.isFirstMonth && membership.monthlyAmount) {
                amount =
                    Number(membership.totalAmount) +
                    Number(membership.monthlyAmount);
                membership.isFirstMonth = false;
                await this.membershipRepo.save(membership);
            } else if (membership.monthlyAmount) {
                amount = Number(membership.monthlyAmount);
            } else {
                amount = Number(membership.totalAmount);
            }

            const newInvoice = this.invoiceRepo.create({
                amount,
                issueDate: new Date(),
                membership,
            });

            return this.invoiceRepo.save(newInvoice);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            } else {
                throw new InternalServerErrorException(error.message);
            }
        }
    }
}
