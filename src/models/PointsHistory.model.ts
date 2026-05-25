import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Customer } from "./Customer.model";
import { Sale } from "./Sale.model";

export type PointsType = "earned" | "redeemed" | "expired";

@Entity({ name: "points_history" })
export class PointsHistory {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "uuid", name: "customer_id" })
	customerId!: string;

	@ManyToOne(() => Customer)
	customer!: Customer;

	@Column({ type: "varchar", length: 20 })
	type!: PointsType;

	@Column({ type: "int" })
	points!: number;

	@Column({ type: "uuid", name: "sale_id", nullable: true })
	saleId!: string;

	@ManyToOne(() => Sale)
	sale!: Sale;

	@Column({ type: "varchar", length: 100, nullable: true })
	reason!: string;

	@Column({ type: "timestamp", name: "expires_at", nullable: true })
	expiresAt!: Date;

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	toJSON() {
		return {
			id: this.id,
			customerId: this.customerId,
			type: this.type,
			points: this.points,
			saleId: this.saleId,
			reason: this.reason,
			expiresAt: this.expiresAt,
			createdAt: this.createdAt,
		};
	}
}
