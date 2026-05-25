import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Products } from "./Products.model";
import { Purchase } from "./Purchase.model";

@Entity({ name: "purchase_items" })
export class PurchaseItem {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "uuid", name: "purchase_id" })
	purchaseId!: string;

	@ManyToOne(
		() => Purchase,
		(purchase) => purchase.items,
	)
	@JoinColumn({ name: "purchase_id" }) // ✅ esto
	purchase!: Purchase;

	@Column({ type: "uuid", name: "product_id" })
	productId!: string;

	@ManyToOne(() => Products)
	@JoinColumn({ name: "product_id" }) // ✅ y esto
	products!: Products;

	@Column({ type: "int" })
	quantity!: number;

	@Column({ type: "decimal", precision: 10, scale: 2, name: "unit_price" })
	unitPrice!: number;

	@Column({ type: "decimal", precision: 10, scale: 2 })
	subtotal!: number;

	toJSON() {
		return {
			id: this.id,
			purchaseId: this.purchaseId,
			productId: this.productId,
			productName: this.products?.name,
			quantity: this.quantity,
			unitPrice: this.unitPrice,
			subtotal: this.subtotal,
		};
	}
}
