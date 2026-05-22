import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'customers' })
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 5, name: 'document_type', default: 'CC' })
    documentType!: string;

    @Column({ type: 'varchar', length: 20, name: 'document_number', unique: true })
    documentNumber!: string;

    @Column({ type: 'varchar', length: 100, name: 'full_name' })
    fullName!: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    email!: string;

    @Column({ type: 'text', nullable: true })
    address!: string;

    @Column({ type: 'int', default: 0 })
    points!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_spent' })
    totalSpent!: number;

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    toJSON() {
        return {
            id: this.id,
            documentType: this.documentType,
            documentNumber: this.documentNumber,
            fullName: this.fullName,
            phone: this.phone,
            email: this.email,
            address: this.address,
            points: this.points,
            totalSpent: this.totalSpent,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}