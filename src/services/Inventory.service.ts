// src/services/Inventory.service.ts
import { InventoryMovementRepository } from '../repositories/InventoryMovement.repository';
import { ProductsRepository } from '../repositories/Products.repository';
import { InventoryMovement, MovementType } from '../models/InventoryMovement.model';
import { Products } from '../models/Products.model';

export class InventoryService {
    private inventoryRepository: InventoryMovementRepository;
    private productRepository: ProductsRepository;

    constructor() {
        this.inventoryRepository = InventoryMovementRepository.getInstance();
        this.productRepository = ProductsRepository.getInstance();
    }

    async registerMovement(
        productId: string,
        type: MovementType,
        quantity: number,
        employeeId: string,
        referenceId?: string,
        reason?: string
    ): Promise<InventoryMovement> {
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        const stockBefore = product.stock;
        let stockAfter = stockBefore;

        if (type === 'purchase' || type === 'return_sale') {
            // Entrada: sumar stock
            stockAfter = stockBefore + quantity;
        } else if (type === 'sale' || type === 'return_purchase' || type === 'adjustment' || type === 'loss') {
            // Salida: restar stock
            if (stockBefore < quantity && type !== 'adjustment') {
                throw new Error(`Stock insuficiente. Disponible: ${stockBefore}`);
            }
            stockAfter = stockBefore - quantity;
        }

        const movement = new InventoryMovement();
        movement.productId = productId;
        movement.type = type;
        movement.quantity = quantity;
        movement.stockBefore = stockBefore;
        movement.stockAfter = stockAfter;
        movement.referenceId = referenceId ?? null;
        movement.reason = reason || '';
        movement.employeeId = employeeId;

        // Actualizar stock del producto
        await this.productRepository.adjustStock(productId, stockAfter);

        return await this.inventoryRepository.save(movement);
    }

    async getProductKardex(productId: string): Promise<InventoryMovement[]> {
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return await this.inventoryRepository.findByProduct(productId);
    }

    async getLowStockProducts(): Promise<any[]> {
        return await this.inventoryRepository.findLowStockMovements();
    }

    async getOutOfStockProducts(): Promise<any[]> {
        return await this.inventoryRepository.findOutOfStock();
    }

    async adjustStock(
        productId: string,
        newStock: number,
        employeeId: string,
        reason: string
    ): Promise<InventoryMovement> {
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        if (newStock < 0) {
            throw new Error('El stock no puede ser negativo');
        }

        if (!reason || reason.trim() === '') {
            throw new Error('El motivo del ajuste es requerido');
        }

        const quantity = newStock - product.stock;
        const type: MovementType = 'adjustment';

        return await this.registerMovement(productId, type, Math.abs(quantity), employeeId, undefined, reason);
    }
}