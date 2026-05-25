import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Employee } from "./Employee.model";
import { Products } from "./Products.model";

export type MovementType =
	| "purchase"
	| "sale"
	| "return_sale"
	| "return_purchase"
	| "adjustment"
	| "loss";

@Entity({ name: "inventory_movements" })
export class InventoryMovement {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "uuid", name: "product_id" })
	productId!: string;

	@ManyToOne(() => Products)
	product!: Products;

	@Column({ type: "varchar", length: 20 })
	type!: MovementType;

	@Column({ type: "int" })
	quantity!: number;

	@Column({ type: "int", name: "stock_before" })
	stockBefore!: number;

	@Column({ type: "int", name: "stock_after" })
	stockAfter!: number;

	@Column({ type: "uuid", name: "reference_id", nullable: true })
	referenceId!: string | null;

	@Column({ type: "varchar", length: 100, nullable: true })
	reason!: string;

	@Column({ type: "uuid", name: "employee_id" })
	employeeId!: string;

	@ManyToOne(() => Employee)
	employee!: Employee;

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	toJSON() {
		return {
			id: this.id,
			productId: this.productId,
			productName: this.product?.name,
			type: this.type,
			quantity: this.quantity,
			stockBefore: this.stockBefore,
			stockAfter: this.stockAfter,
			referenceId: this.referenceId,
			reason: this.reason,
			employeeId: this.employeeId,
			createdAt: this.createdAt,
		};
	}
}
