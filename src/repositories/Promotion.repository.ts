import { appDataSource } from "../config/database.config";
import { Promotion } from "../models/Promotion.model";
import { Repository, Between } from "typeorm";

export class PromotionRepository {
    private static instance: PromotionRepository;
    private repo: Repository<Promotion>;

    private constructor() {
        this.repo = appDataSource.getRepository(Promotion);
    }

    public static getInstance(): PromotionRepository {
        if (!PromotionRepository.instance) {
            PromotionRepository.instance = new PromotionRepository();
        }
        return PromotionRepository.instance;
    }

    async findAll(): Promise<Promotion[]> {
        return await this.repo.find({
            order: { createdAt: 'DESC' }
        })
    }

    async findAllActive(): Promise<Promotion[]> {
        const now = new Date();
        return await this.repo.find({
            where: {
                isActive: true,
                startDate: Between(new Date('2000-01-01'), now),
                endDate: Between(now, new Date('3000-01-01'))
            }
        })
    }

    async findById(id: string): Promise<Promotion | null> {
        return await this.repo.findOneBy({ id });
    }
    async findActiveByProduct(productId: string): Promise<Promotion[]> {
        const now = new Date();
        return await this.repo.find({
            where: {
                isActive: true,
                productId,
                startDate: Between(new Date('2000-01-01'), now),
                endDate: Between(now, new Date('3000-01-01'))
            }
        });
    }

    async findActiveByCategory(categoryId: string): Promise<Promotion[]> {
        const now = new Date();
        return await this.repo.find({
            where: {
                isActive: true,
                categoryId,
                startDate: Between(new Date('2000-01-01'), now),
                endDate: Between(now, new Date('3000-01-01'))
            }
        });
    }

    async findActiveTotalPromotions(minPurchase: number): Promise<Promotion[]> {
        const now = new Date();
        return await this.repo.find({
            where: {
                isActive: true,
                type: 'percentage_total',
                minPurchase: Between(0, minPurchase),
                startDate: Between(new Date('2000-01-01'), now),
                endDate: Between(now, new Date('3000-01-01'))
            },
            order: { value: 'DESC' }
        });
    }

    async save(promotion: Promotion): Promise<Promotion> {
        return await this.repo.save(promotion);
    }

    async update(id: string, data: Partial<Promotion>): Promise<Promotion | null> {
        await this.repo.update(id, data);
        return await this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repo.delete(id);
        return result.affected !== null && result.affected !== undefined && result.affected > 0;
    }
}