import { appDataSource } from '../config/database.config';
import { InventoryMovement } from '../models/InventoryMovement.model';
import { Repository, Between } from 'typeorm';

export class InventoryMovementRepository {
    private static instance: InventoryMovementRepository;
    private repo: Repository<InventoryMovement>;

    private constructor() {
        this.repo = appDataSource.getRepository(InventoryMovement);
    }

    public static getInstance(): InventoryMovementRepository {
        if (!InventoryMovementRepository.instance) {
            InventoryMovementRepository.instance = new InventoryMovementRepository();
        }
        return InventoryMovementRepository.instance;
    }


    async save(movement: InventoryMovement): Promise<InventoryMovement> {
        return await this.repo.save(movement);
    }

    async findByProduct(productId: string): Promise<InventoryMovement[]> {
        return await this.repo.find({
            where: { productId },
            relations: ['product', 'employee'],
            order: { createdAt: 'DESC' }
        });
    }

  async findByProductAndDateRange(productId: string, startDate: Date, endDate: Date): Promise<InventoryMovement[]> {
        return await this.repo.find({
            where: {
                productId,
                createdAt: Between(startDate, endDate)
            },
            order: { createdAt: 'ASC' }
        });
    }

    async findLowStockMovements(): Promise<InventoryMovement[]> {
        // Productos con stock bajo (por debajo del min_stock)
        const query = `
            SELECT p.id, p.name, p.stock, p.min_stock, p.barcode
            FROM products p
            WHERE p.is_active = true AND p.stock <= p.min_stock
            ORDER BY p.stock ASC
        `;
        return await this.repo.query(query);
    }

    async findOutOfStock(): Promise<any[]> {
        const query = `
            SELECT p.id, p.name, p.barcode, p.stock
            FROM products p
            WHERE p.is_active = true AND p.stock = 0
            ORDER BY p.name ASC
        `;
        return await this.repo.query(query);
    }

    
}

