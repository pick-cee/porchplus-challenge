import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
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
}
