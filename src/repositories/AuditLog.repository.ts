import { appDataSource } from "../config/database.config";
import { AuditLog } from "../models/AuditLog.model";
import { Repository, Between } from "typeorm";

export class AuditLogRepository {
    private static instance: AuditLogRepository
    private repo: Repository<AuditLog>

    constructor() {
        this.repo = appDataSource.getRepository(AuditLog)
    }

    public static getInstance(): AuditLogRepository {
        if (!AuditLogRepository.instance) {
            AuditLogRepository.instance = new AuditLogRepository();
        }
        return AuditLogRepository.instance
    }

    async save(log: AuditLog): Promise<AuditLog> {
        return await this.repo.save(log)
    }

     async findAll(limit: number = 100, offset: number = 0): Promise<[AuditLog[], number]> {
        return await this.repo.findAndCount({
            relations: ['employee'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset
        });
    }

    async findByEntity(entity: string, entityId: string): Promise<AuditLog[]> {
        return await this.repo.find({
            where: { entity, entityId },
            relations: ['employee'],
            order: { createdAt: 'DESC' }
        });
    }

    async findByEmployee(employeeId: string): Promise<AuditLog[]> {
        return await this.repo.find({
            where: { employeeId },
            relations: ['employee'],
            order: { createdAt: 'DESC' }
        });
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
        return await this.repo.find({
            where: { createdAt: Between(startDate, endDate) },
            relations: ['employee'],
            order: { createdAt: 'DESC' }
        });
    }
}