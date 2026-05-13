import { appDataSource } from '../config/database.config';
import { CashMovement } from '../models/CashMovement.model';
import { Repository } from 'typeorm';

export class CashMovementRepository {
    private static instance: CashMovementRepository;
    private repo: Repository<CashMovement>;

    private constructor() {
        this.repo = appDataSource.getRepository(CashMovement);
    }

    public static getInstance(): CashMovementRepository {
        if (!CashMovementRepository.instance) {
            CashMovementRepository.instance = new CashMovementRepository();
        }
        return CashMovementRepository.instance;
    }

    async save(movement: CashMovement): Promise<CashMovement> {
        return await this.repo.save(movement);
    }

    async findByShift(cashShiftId: string): Promise<CashMovement[]> {
        return await this.repo.find({
            where: { cashShiftId },
            order: { createdAt: 'ASC' }
        });
    }

    async findByShiftAndType(cashShiftId: string, type: string): Promise<CashMovement[]> {
        return await this.repo.find({
            where: { cashShiftId, type: type as any }
        });
    }

    async getTotalByShiftAndType(cashShiftId: string, type: string): Promise<number> {
        const result = await this.repo
            .createQueryBuilder('movement')
            .select('SUM(movement.amount)', 'total')
            .where('movement.cashShiftId = :cashShiftId', { cashShiftId })
            .andWhere('movement.type = :type', { type })
            .getRawOne();
        
        return parseFloat(result?.total) || 0;
    }
}