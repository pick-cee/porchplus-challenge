import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Invoice } from "./invoice.schema";
import { Member } from "./member.schema";

export enum MEMBERSHIP_TYPE {
    ANNUAL_BASIC = "annual_basic",
    MONTHLY_PREMIUM = "monthly_premium",
}

@Entity({ name: "Membership" })
export class Membership {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "enum",
        enum: MEMBERSHIP_TYPE,
        default: MEMBERSHIP_TYPE.ANNUAL_BASIC,
    })
    membershipType: MEMBERSHIP_TYPE;

    @Column({ type: "timestamp", nullable: false })
    startDate: Date;

    @Column({ type: "timestamp", nullable: false })
    dueDate: Date;

    @Column({ type: "timestamp", nullable: true })
    monthlyDueDate: Date;

    @Column({ type: "boolean", default: true })
    isFirstMonth: boolean;

    @Column({ type: "decimal", nullable: true })
    monthlyAmount: number;

    @Column({ type: "decimal" })
    totalAmount: number;

    @Column({ nullable: true })
    memberId: string;

    @ManyToOne(() => Member, (member) => member.memberships)
    @JoinColumn({ name: "memberId" })
    member: Member;

    @OneToMany(() => Invoice, (invoice) => invoice.membership)
    invoices: Invoice[];

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
}
