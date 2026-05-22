import { AuditLogRepository } from "../repositories/AuditLog.repository";
import { AuditLog, AuditAction } from "../models/AuditLog.model";


export class AuditLogService {
    private auditLogRepository: AuditLogRepository

    constructor() {
        this.auditLogRepository = AuditLogRepository.getInstance();
    }

    async log(employeeId: string,
        action: AuditAction,
        entity?: string,
        entityId?: string,
        oldValue?: any,
        newValue?: any,
        ipAddress?: string): Promise<AuditLog> {

        const log = new AuditLog();
        log.employeeId = employeeId;
        log.action = action;
        log.entity = entity || '';
        log.entityId = entityId || '';
        log.oldValue = oldValue || null;
        log.newValue = newValue || null;
        log.ipAddress = ipAddress || '';

        return await this.auditLogRepository.save(log)
    }

    async getAllLogs(page: number = 1, limit: number = 100): Promise<{ logs: AuditLog[]; total: number; page: number; totalPages: number }> {
        const offset = (page - 1) * limit;
        const [logs, total] = await this.auditLogRepository.findAll(limit, offset);

        return {
            logs,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getLogsByEntity(entity: string, entityId: string): Promise<AuditLog[]> {
        return await this.auditLogRepository.findByEntity(entity, entityId);
    }

    async getLogsByEmployee(employeeId: string): Promise<AuditLog[]> {
        return await this.auditLogRepository.findByEmployee(employeeId);
    }

    async getLogsByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
        return await this.auditLogRepository.findByDateRange(startDate, endDate);
    }
}
