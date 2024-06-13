import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Invoice, Member, Membership } from "./schemas";
import { Repository } from "typeorm";
import { CreateMemberDto } from "./DTOS";

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Member) private memberRepo: Repository<Member>,
    @InjectRepository(Membership)
    private mmebershipRepo: Repository<Membership>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
  ) { }

  async register(memberDto: CreateMemberDto): Promise<Member> {
    try {
      const memberExists = await this.memberRepo.findOne({
        where: { email: memberDto.email }
      })
      if (memberExists) {
        throw new BadRequestException('User already exists')
      }
      const newMemeber = this.memberRepo.create(memberDto)
      return await this.memberRepo.save(newMemeber)
    }
    catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      else {
        throw new InternalServerErrorException(error.message)
      }
    }
  }

  async
}
