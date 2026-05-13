import { open } from "node:fs";
import { appDataSource } from "../config/database.config";
import { CashShift } from "../models/CashShift.model";
import { Repository } from "typeorm";

export class CashShiftRepository {
    private static instance: CashShiftRepository
    private repo: Repository<CashShift>

    constructor() {
        this.repo = appDataSource.getRepository(CashShift)
    }

    public static getInstance(): CashShiftRepository {
        if (!CashShiftRepository.instance) {
            CashShiftRepository.instance = new CashShiftRepository()
        }
        return CashShiftRepository.instance
    }

    async findCurrentShiftByEmployee(employeeId: string): Promise<CashShift | null> {
        return await this.repo.findOne({
            where: { employeeId, status: 'open' },
            relations: ['employee']
        })
    }

    async findById(id: string): Promise<CashShift | null> {
        return await this.repo.findOne({
            where: { id },
            relations: ['employee']
        })
    }

    async findByEmployee(employeeId: string): Promise<CashShift[]> {
        return await this.repo.find({
            where: { employeeId },
            order: { openingTime: 'DESC' }
        })
    }

    async save(shift: CashShift): Promise<CashShift > {
        return await this.repo.save(shift)
    }
    async update(id:string , data: Partial<CashShift>): Promise<CashShift | null>{
        await this.repo.update(id,data)
        return await this.findById(id)
    }
}