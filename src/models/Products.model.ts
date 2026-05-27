import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { Category } from "./Category.model";

@Entity({ name: "products" })
export class Products {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar", unique: true, length: 50 })
	barcode!: string;

	@Column({ type: "varchar", length: 100 })
	name!: string;

	@Column({ type: "text", nullable: true })
	description!: string;

	@Column({ type: "uuid", name: "category_id", nullable: true })
	categoryId!: string;

	@ManyToOne(() => Category)
	category!: Category;

	@Column({ type: "decimal", precision: 10, scale: 2, name: "purchase_price" })
	purchasePrice!: number;

	@Column({ type: "decimal", precision: 10, scale: 2, name: "sale_price" })
	salePrice!: number;

	@Column({
		type: "decimal",
		precision: 10,
		scale: 2,
		name: "offer_price",
		nullable: true,
	})
	offerPrice!: number | null;

	@Column({ type: "int", default: 0 })
	stock!: number;

	@Column({ type: "int", default: 5, name: "min_stock" })
	minStock!: number;

	@Column({ type: "varchar", length: 50, nullable: true })
	location!: string;

	@Column({ type: "varchar", length: 5, default: "A", name: "tax_code" })
	taxCode!: string; // A=19%, B=5%, C=EXENTO, D=CONSUMO

	@Column({type: "varchar", length: 20, default: "unit"})
	unit!: string; // unit, kg, liter, etc.

	@Column({ type: "boolean", default: true, name: "is_active" })
	isActive!: boolean;

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date;

	toJSON() {
		return {
			id: this.id,
			barcode: this.barcode,
			name: this.name,
			description: this.description,
			categoryId: this.categoryId,
			purchasePrice: this.purchasePrice,
			salePrice: this.salePrice,
			offerPrice: this.offerPrice,
			stock: this.stock,
			minStock: this.minStock,
			location: this.location,
			taxCode: this.taxCode,
			unit: this.unit,
			isActive: this.isActive,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
