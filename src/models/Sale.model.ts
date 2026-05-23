import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Employee } from './Employee.model';
import { Customer } from './Customer.model';
import { CashShift } from './CashShift.model';
import { SaleItem } from './SaleItem.model';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mixed';
export type SaleStatus = 'completed' | 'cancelled';

@Entity({ name: 'sales' })
export class Sale {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 20, name: 'sale_number', unique: true })
    saleNumber!: string;

    @Column({ type: 'uuid', name: 'cash_shift_id' })
    cashShiftId!: string;

    @ManyToOne(() => CashShift)
    cashShift!: CashShift;

    @Column({ type: 'uuid', name: 'employee_id' })
    employeeId!: string;

    @ManyToOne(() => Employee)
    employee!: Employee;

    @Column({ type: 'uuid', name: 'customer_id', nullable: true })
    customerId!: string | null;

    @ManyToOne(() => Customer)
    customer!: Customer;

    @Column({ type: 'varchar', length: 100, nullable: true, name: 'customer_name' })
    customerName!: string;

    @Column({ type: 'varchar', length: 20, nullable: true, name: 'customer_document' })
    customerDocument!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    subtotal!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    discount!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'subtotal_with_discount' })
    subtotalWithDiscount!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    tax!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    total!: number;

    @Column({ type: 'int', default: 0, name: 'points_earned' })
    pointsEarned!: number;

    @Column({ type: 'int', default: 0, name: 'points_used' })
    pointsUsed!: number;

    @Column({ type: 'varchar', length: 20, name: 'payment_method' })
    paymentMethod!: PaymentMethod;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'cash_received' })
    cashReceived!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'cash_change' })
    cashChange!: number;

    @Column({ type: 'varchar', length: 50, nullable: true, name: 'card_receipt' })
    cardReceipt!: string;

    @Column({ type: 'varchar', length: 50, nullable: true, name: 'card_rrn' })
    cardRrn!: string;

    @Column({ type: 'varchar', length: 50, nullable: true, name: 'card_approval' })
    cardApproval!: string;

    @Column({ type: 'varchar', length: 100, nullable: true, name: 'transfer_reference' })
    transferReference!: string;

    @Column({ type: 'varchar', length: 20, default: 'completed' })
    status!: SaleStatus;

    @Column({ type: 'uuid', name: 'cancelled_by', nullable: true })
    cancelledBy!: string;

    @Column({ type: 'text', nullable: true, name: 'cancelled_reason' })
    cancelledReason!: string;

    @Column({ type: 'timestamp', name: 'cancelled_at', nullable: true })
    cancelledAt!: Date;

    @CreateDateColumn({ name: 'sale_date' })
    saleDate!: Date;

    @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
    items!: SaleItem[];

    toJSON() {
        return {
            id: this.id,
            saleNumber: this.saleNumber,
            cashShiftId: this.cashShiftId,
            employeeId: this.employeeId,
            customerId: this.customerId,
            customerName: this.customerName,
            customerDocument: this.customerDocument,
            subtotal: this.subtotal,
            discount: this.discount,
            subtotalWithDiscount: this.subtotalWithDiscount,
            tax: this.tax,
            total: this.total,
            pointsEarned: this.pointsEarned,
            pointsUsed: this.pointsUsed,
            paymentMethod: this.paymentMethod,
            cashReceived: this.cashReceived,
            cashChange: this.cashChange,
            cardReceipt: this.cardReceipt,
            cardRrn: this.cardRrn,
            cardApproval: this.cardApproval,
            transferReference: this.transferReference,
            status: this.status,
            saleDate: this.saleDate,
            items: this.items?.map(i => i.toJSON())
        };
    }
}