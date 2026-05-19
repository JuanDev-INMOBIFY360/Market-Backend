import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Entity } from "typeorm";

@Entity({ name: 'suppliers' })

export class Supplier {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
    nit!: string;

    @Column({ type: 'varchar', length: 100, nullable: true, name: 'contac_name' })
    contactName!: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    email!: string;

    @Column({ type: 'text', nullable: true })
    address!: string;

    @Column({ type: 'int', default: 0, name: 'credit_days' })
    creditDays!: number;

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            nit: this.nit,
            contactName: this.contactName,
            phone: this.phone,
            email: this.email,
            address: this.address,
            creditDays: this.creditDays,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }
}