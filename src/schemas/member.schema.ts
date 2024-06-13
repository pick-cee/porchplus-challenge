import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Membership } from "./membership.schema";

@Entity({ name: "Member" })
export class Member {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", nullable: false })
    firstName: string;

    @Column({ type: "varchar", nullable: false })
    lastName: string;

    @Column({ type: "varchar", nullable: false })
    email: string;

    @OneToMany(() => Membership, (membership) => membership.member)
    memberships: Membership[];
}
