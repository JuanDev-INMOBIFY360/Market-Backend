import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,JoinColumn } from 'typeorm';
import { Sale } from './Sale.model';
import { Products } from './Products.model';

@Entity({ name: 'sale_items' })
export class SaleItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', name: 'sale_id' })
    saleId!: string;

    @ManyToOne(() => Sale, (sale) => sale.items)
    @JoinColumn({ name: 'sale_id' })
    sale!: Sale;

    @Column({ type: 'uuid', name: 'product_id' })
    productId!: string;

    @ManyToOne(() => Products)
    product!: Products;

    @Column({ type: 'int' })
    quantity!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price' })
    unitPrice!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    discount!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal!: number;

    @Column({ type: 'varchar', length: 5, name: 'tax_code' })
    taxCode!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'tax_amount' })
    taxAmount!: number;

    toJSON() {
        return {
            id: this.id,
            saleId: this.saleId,
            productId: this.productId,
            productName: this.product?.name,
            productBarcode: this.product?.barcode,
            quantity: this.quantity,
            unitPrice: this.unitPrice,
            discount: this.discount,
            subtotal: this.subtotal,
            taxCode: this.taxCode,
            taxAmount: this.taxAmount
        };
    }
}