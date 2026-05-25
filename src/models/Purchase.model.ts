import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { Employee } from "./Employee.model";
import { PurchaseItem } from "./PurchaseItem.model";
import { Supplier } from "./Supplier.model";

export type PurchaseStatus = "pending" | "completed" | "cancelled";

@Entity({ name: "purchases" })
export class Purchase {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "uuid", name: "supplier_id" })
	supplierId!: string;

	@ManyToOne(() => Supplier)
	supplier!: Supplier;

	@Column({ type: "varchar", length: 50, name: "invoice_number", unique: true })
	invoiceNumber!: string;

	@Column({ type: "uuid", name: "employee_id" })
	employeeId!: string;

	@ManyToOne(() => Employee)
	employee!: Employee;

	@Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
	subtotal!: number;

	@Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
	tax!: number;

	@Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
	total!: number;

	@Column({
		type: "timestamp",
		name: "purchase_date",
		default: () => "CURRENT_TIMESTAMP",
	})
	purchaseDate!: Date;

	@Column({ type: "varchar", length: 20, default: "pending" })
	status!: PurchaseStatus;

	@Column({ type: "text", nullable: true })
	notes!: string;

	@OneToMany(
		() => PurchaseItem,
		(item) => item.purchase,
		{ cascade: false },
	)
	items!: PurchaseItem[];

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date;

	toJSON() {
		return {
			id: this.id,
			supplierId: this.supplierId,
			invoiceNumber: this.invoiceNumber,
			employeeId: this.employeeId,
			subtotal: this.subtotal,
			tax: this.tax,
			total: this.total,
			purchaseDate: this.purchaseDate,
			status: this.status,
			notes: this.notes,
			items: this.items?.map((i) => i.toJSON()),
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
