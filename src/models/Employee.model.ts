import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

export type EmployeeRole = "owner" | "admin" | "cashier" | "weaehouse";

@Entity({ name: "employees" })
export class Employee {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar", length: 20, unique: true })
	code!: string;

	@Column({ type: "varchar", length: 100 })
	fullName!: string;

	@Column({ type: "varchar", length: 10, default: "CC" })
	documentType!: string;

	@Column({ type: "varchar", length: 10, unique: true })
	documentNumber!: string;

	@Column({ type: "varchar", length: 20, nullable: true })
	phone!: string;

	@Column({ type: "varchar", length: 100, unique: true })
	email!: string;

	@Column({ type: "varchar", length: 20 })
	role!: EmployeeRole;

	@Column({ type: "varchar", length: 255 })
	passwordHash!: string;

	@Column({ type: "boolean", default: true })
	mustChangePassword!: boolean;

	@Column({ type: "boolean", default: true })
	isActive!: boolean;

	@Column({ type: "date", nullable: true })
	hireDate!: Date;

	@Column({ type: "date", nullable: true })
	terminationDate!: Date;

	@Column({ type: "varchar", length: 100, nullable: true })
	createdBy!: string;

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date;

	toJSON() {
		return {
			id: this.id,
			code: this.code,
			fullName: this.fullName,
			documentType: this.documentType,
			documentNumber: this.documentNumber,
			phone: this.phone,
			email: this.email,
			role: this.role,
			isActive: this.isActive,
			hireDate: this.hireDate,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
