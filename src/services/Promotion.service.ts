import { PromotionRepository } from "../repositories/Promotion.repository";
import { Promotion, PromotionType } from "../models/Promotion.model";
import { validate as isUUID } from 'uuid';
import { appDataSource } from "../config/database.config";
import { ProductsRepository } from "../repositories/Products.repository";


export class PromotionService {

    private promotionRepository: PromotionRepository
    private productsRepository: ProductsRepository

    constructor() {
        this.promotionRepository = PromotionRepository.getInstance();
        this.productsRepository = ProductsRepository.getInstance();
    }

    async createPromotion(data: {
        name: string;
        type: PromotionType;
        startDate: Date;
        endDate: Date;
        description?: string;
        productId?: string;
        categoryId?: string;
        value?: number;
        minPurchase?: number;
        buyQuantity?: number;
        getQuantity?: number;
        weekdays?: number[];
    }): Promise<Promotion> {


        if (!data.name || data.name.length < 3) {
            throw new Error('El nombre debe tener al menos 3 caracteres');
        }
        if (data.startDate >= data.endDate) {
            throw new Error('La fecha de inicio debe ser menor a la fecha de fin');
        }

        //validar segun el tipo 
        switch (data.type) {
            case 'percentage_product':
                if (!data.productId || !isUUID(data.productId)) {
                    throw new Error('Producto requerido para promoción de producto');
                }
                if (!data.value || data.value <= 0 || data.value > 100) {
                    throw new Error('El porcentaje debe ser entre 1 y 100');
                }
                break;
            case 'percentage_category':

                if (!data.categoryId || !isUUID(data.categoryId)) {
                    throw new Error('Categoría requerida para promoción de categoría');
                }
                if (!data.value || data.value <= 0 || data.value > 100) {
                    throw new Error('El porcentaje debe ser entre 1 y 100');
                }
                break;


            case 'percentage_total':
                if (!data.value || data.value <= 0 || data.value > 100) {
                    throw new Error('El porcentaje debe ser entre 1 y 100');
                }
                if (data.minPurchase && data.minPurchase < 0) {
                    throw new Error('El monto mínimo no puede ser negativo');
                }
                break;

            case 'buy_x_get_y':
                if (!data.productId && !data.categoryId) {
                    throw new Error('Producto o categoría requerida para promoción 2x1');
                }
                if (!data.buyQuantity || data.buyQuantity <= 0) {
                    throw new Error('Cantidad a comprar requerida');
                }
                if (!data.getQuantity || data.getQuantity <= 0) {
                    throw new Error('Cantidad a obtener requerida');
                }
                break;
        }

        const promotion = new Promotion()

        promotion.name = data.name;
        promotion.type = data.type;
        promotion.description = data.description || '';
        promotion.productId = data.productId ?? null;
        promotion.categoryId = data.categoryId ?? null;
        promotion.value = data.value || 0;
        promotion.minPurchase = data.minPurchase || 0;
        promotion.buyQuantity = data.buyQuantity || 0;
        promotion.getQuantity = data.getQuantity || 0;
        promotion.startDate = data.startDate;
        promotion.endDate = data.endDate;
        promotion.weekdays = data.weekdays || [];
        promotion.isActive = true;

        return this.promotionRepository.save(promotion)
    }
    async getAllPromotions(): Promise<Promotion[]> {
        return await this.promotionRepository.findAll();
    }

    async getActivePromotions(): Promise<Promotion[]> {
        return await this.promotionRepository.findAllActive();
    }

    async getPromotionById(id: string): Promise<Promotion> {
        if (!isUUID(id)) {
            throw new Error('ID de promoción inválido');
        }
        const promotion = await this.promotionRepository.findById(id);
        if (!promotion) {
            throw new Error('Promoción no encontrada');
        }
        return promotion;
    }

    async updatePromotion(id: string, data: Partial<Promotion>): Promise<Promotion> {
        const promotion = await this.getPromotionById(id);
        const updated = await this.promotionRepository.update(id, data);
        if (!updated) {
            throw new Error('Error al actualizar la promoción');
        }
        return updated;
    }

    async deletePromotion(id: string): Promise<void> {
        const promotion = await this.getPromotionById(id);
        await this.promotionRepository.delete(id);
    }

    async calculateDiscountForCart(cartItems: any[], total: number): Promise<{ discountAmount: number; appliedPromotions: Promotion[] }> {

        let maxDiscount = 0
        let bestPromotion: Promotion | null = null

        const activePromotions = await this.promotionRepository.findAllActive();
        const today = new Date().getDay();

        for (const promo of activePromotions) {
            if (promo.weekdays && promo.weekdays.length > 0) {
                if (!promo.weekdays.includes(today)) {
                    continue
                }
            }
            let discount = 0
            switch (promo.type) {
                case 'percentage_total':
                    if (total >= promo.minPurchase) {
                        discount = total * (promo.value / 100)
                    }
                    break;
                case 'percentage_product':
                    for (const item of cartItems) {
                        if (item.productId === promo.productId) {
                            discount += item.subtotal * (promo.value / 100);
                        }
                    }
                    break;
                case 'percentage_category':
                    if (!promo.categoryId)break;

                    const producsId =  cartItems.map(item => item.productId);
                    
                    for (const items of cartItems) {
                        const products = await this.productsRepository.findById(items.productId);
                        if(products && products.categoryId === promo.categoryId){
                            discount += items.subtotal * (promo.value / 100);
                        }
                    } 
                        
                    
                   
                    break;
                case 'buy_x_get_y':
                    for (const item of cartItems) {
                        if (item.productId === promo.productId) {
                            const freeItems = Math.floor(item.quantity / promo.buyQuantity) * promo.getQuantity;
                            const discountValue = freeItems * item.unitPrice;
                            discount += discountValue;
                        }
                    }
                    break;
            }

            if (discount > maxDiscount) {
                maxDiscount = discount;
                bestPromotion = promo;
            }
        }

        return {
            discountAmount: maxDiscount,
            appliedPromotions: bestPromotion ? [bestPromotion] : []
        };
    }
}
