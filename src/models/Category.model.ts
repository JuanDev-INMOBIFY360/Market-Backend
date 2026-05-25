import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { Employee } from "./Employee.model";

@Entity({ name: "categories" })
export class Category {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar", length: 50 })
	name!: string;

	@Column({ type: "text", nullable: true })
	description!: string;

	@Column({ type: "uuid", name: "parent_id", nullable: true })
	parentId!: string | null;

	@ManyToOne(
		() => Category,
		(category) => category.children,
	)
	parent!: Category | null;

	@OneToMany(
		() => Category,
		(category) => category.parent,
	)
	children!: Category[];

	@Column({ type: "varchar", length: 5, default: "A" })
	taxCode!: string; // A=19%, B=5%, C=EXENTO, D=CONSUMO

	@Column({ type: "boolean", default: true, name: "is_active" })
	isActive!: boolean;

	@Column({ type: "int", default: 0, name: "display_order" })
	displayOrder!: number;

	@Column({ type: "uuid", name: "created_by", nullable: true })
	createdBy!: string;

	@ManyToOne(() => Employee)
	employee!: Employee;

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date;

	toJSON() {
		return {
			id: this.id,
			name: this.name,
			description: this.description,
			parentId: this.parentId,
			taxCode: this.taxCode,
			isActive: this.isActive,
			displayOrder: this.displayOrder,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
