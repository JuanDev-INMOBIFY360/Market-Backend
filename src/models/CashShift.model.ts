import { Entity,PrimaryGeneratedColumn,Column,UpdateDateColumn,CreateDateColumn, ManyToOne,JoinColumn } from "typeorm";
import { Employee } from "./Employee.model";


export type ShiftStatus = 'open' | 'closed' | 'suspended'

@Entity({name: 'cash_shifts0'})

export class CashShift  {

    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({type: 'uuid' , name: 'employee_id'})
    employeeId!: string;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: 'employee_id' })
    employee!: Employee

    @Column({ type: 'timestamp', name: 'opening_time' })
    openingTime!: Date;

    @Column({ type: 'timestamp', name: 'closing_time', nullable: true })
    closingTime!: Date;

    @Column({type: 'decimal',precision: 10,  scale: 2 , name: 'opening_balance' })
    openingBalance!: number

     @Column({ type: 'decimal', precision: 10, scale: 2, name: 'closing_balance', nullable: true })
    closingBalance!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'expected_balance', nullable: true })
    expectedBalance!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    difference!: number;

    @Column({ type: 'varchar', length: 20, default: 'open' })
    status!: ShiftStatus;

    @Column({ type: 'text', nullable: true })
    notes!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    toJSON(){
        return{
            id: this.id,
            employeeId: this.employeeId,
            openingTime: this.openingTime,
            closingTime: this.closingTime,
            openingBalance: this.openingBalance,
            closingBalance: this.closingBalance,
            expectedBalance: this.expectedBalance,
            difference: this.difference,
            status: this.status,
            notes: this.notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }
}   