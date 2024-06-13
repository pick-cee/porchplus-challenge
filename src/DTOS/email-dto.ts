import { Invoice, MEMBERSHIP_TYPE } from "src/schemas";

export class AnnualEmailDto {
    mebershipType: MEMBERSHIP_TYPE;
    firstName: string;
    lastName: string;
    email: string;
    totalAmount: number;
    dueDate: Date;
    invoice: Partial<Invoice>;
}

export class FirstMonthReminderDto {
    membershipType: MEMBERSHIP_TYPE;
    firstName: string;
    lastName: string;
    email: string;
    dueAmount: number;
    invoice: Partial<Invoice>;
}

export class MonthlyEmailDto {
    membershipType: MEMBERSHIP_TYPE;
    firstName: string;
    lastName: string;
    email: string;
    monthlyAmount: number;
    dueDate: Date;
    invoice: Partial<Invoice>;
}
