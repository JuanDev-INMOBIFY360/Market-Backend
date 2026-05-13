import { PrimaryGeneratedColumn,Column,Entity,ManyToMany,CreateDateColumn,ManyToOne } from "typeorm";
import { Employee } from "./Employee.model";
import { CashShift } from "./CashShift.model";


export type MovementType = 'opening' | 'sale' | 'refund' | 'expense' | 'income' | 'withdrawal';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'points';

@Entity({name: 'cash_movements'})

export class  CashMovement  {

    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({type: 'uuid', name: 'cash_shift_id' })
    cashShiftId!: string

    @ManyToOne(() => CashShift)
    cashShift! : CashShift

    @Column({type: 'uuid', name: 'employee_id' })
    employeeId!: string

    @ManyToOne(() => Employee)
    employee!: Employee
    
    @Column({ type: 'varchar', length: 30 })
    type!: MovementType;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    @Column({ type: 'varchar', length: 20, nullable: true, name: 'payment_method' })
    paymentMethod!: PaymentMethod;

    @Column({ type: 'uuid', name: 'reference_id', nullable: true })
    referenceId!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
    
    toJSON(){
        return{
           id: this.id,
            cashShiftId: this.cashShiftId,
            employeeId: this.employeeId,
            type: this.type,
            amount: this.amount,
            paymentMethod: this.paymentMethod,
            referenceId: this.referenceId,
            description: this.description,
            createdAt: this.createdAt

        }
    }
}