import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Membership } from "./membership.schema";

@Entity({ name: "Invoice" })
export class Invoice {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "decimal" })
    amount: number;

    @Column({ type: "timestamp" })
    issueDate: Date;

    @Column()
    membershipId: string;

    @ManyToOne(() => Membership, (mmebership) => mmebership.invoices)
    @JoinColumn({ name: "membershipId" })
    membership: Membership;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
}
