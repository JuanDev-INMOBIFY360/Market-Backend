import { Entity, PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn } from "typeorm";

export type PromotionType = 'percentage_product' | 'percentage_category' | 'percentage_total' | 'buy_x_get_y';

@Entity({name:'promotions'})
export class Promotion  {

    @PrimaryGeneratedColumn('uuid')
    id!:string

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({ type: 'varchar', length: 30, name: 'promotion_type' })
    type!: PromotionType;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column({ type: 'uuid', name: 'product_id', nullable: true })
    productId!: string;

    @Column({ type: 'uuid', name: 'category_id', nullable: true })
    categoryId!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    value!: number;
    
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'min_purchase' })
    minPurchase!: number;

    @Column({ type: 'int', nullable: true, name: 'buy_quantity' })
    buyQuantity!: number;

    @Column({ type: 'int', nullable: true, name: 'get_quantity' })
    getQuantity!: number;

    @Column({ type: 'timestamp', name: 'start_date' })
    startDate!: Date;

    @Column({ type: 'timestamp', name: 'end_date' })
    endDate!: Date;

    @Column({ type: 'int', array: true, nullable: true })
    weekdays!: number[];

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
            type: this.type,
            description: this.description,
            productId: this.productId,
            categoryId: this.categoryId,
            value: this.value,
            minPurchase: this.minPurchase,
            buyQuantity: this.buyQuantity,
            getQuantity: this.getQuantity,
            startDate: this.startDate,
            endDate: this.endDate,
            weekdays: this.weekdays,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}