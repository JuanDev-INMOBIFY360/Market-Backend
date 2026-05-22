import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Employee } from './Employee.model';

export type AuditAction = 
    | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED'
    | 'EMPLOYEE_CREATED' | 'EMPLOYEE_UPDATED' | 'EMPLOYEE_DELETED'
    | 'PRODUCT_CREATED' | 'PRODUCT_UPDATED' | 'PRODUCT_DELETED' | 'PRODUCT_PRICE_CHANGED' | 'PRODUCT_STOCK_ADJUSTED'
    | 'SALE_CREATED' | 'SALE_CANCELLED' | 'SALE_REFUNDED'
    | 'PURCHASE_CREATED' | 'PURCHASE_CANCELLED'
    | 'SHIFT_OPENED' | 'SHIFT_CLOSED' | 'SHIFT_SUSPENDED' | 'CASH_MOVEMENT_CREATED'
    | 'CONFIG_UPDATED'
    | 'PROMOTION_CREATED' | 'PROMOTION_UPDATED' | 'PROMOTION_DELETED'
    | 'CUSTOMER_CREATED' | 'CUSTOMER_UPDATED' | 'CUSTOMER_DELETED';

@Entity({ name: 'audit_logs' })
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', name: 'employee_id' })
    employeeId!: string;

    @ManyToOne(() => Employee)
    employee!: Employee;

    @Column({ type: 'varchar', length: 50 })
    action!: AuditAction;

    @Column({ type: 'varchar', length: 50, nullable: true })
    entity!: string;

    @Column({ type: 'uuid', name: 'entity_id', nullable: true })
    entityId!: string;

    @Column({ type: 'jsonb', name: 'old_value', nullable: true })
    oldValue!: any;

    @Column({ type: 'jsonb', name: 'new_value', nullable: true })
    newValue!: any;

    @Column({ type: 'varchar', length: 45, name: 'ip_address', nullable: true })
    ipAddress!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    toJSON() {
        return {
            id: this.id,
            employeeId: this.employeeId,
            employeeName: this.employee?.fullName,
            action: this.action,
            entity: this.entity,
            entityId: this.entityId,
            oldValue: this.oldValue,
            newValue: this.newValue,
            ipAddress: this.ipAddress,
            createdAt: this.createdAt
        };
    }
}
