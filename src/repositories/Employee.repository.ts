import type { Repository } from "typeorm";
import { appDataSource } from "../config/database.config";
import { Employee } from "../models/Employee.model";

export class EmployeeRepository {
	private static instance: EmployeeRepository;
	private repo: Repository<Employee>;

	private constructor() {
		this.repo = appDataSource.getRepository(Employee);
	}

	public static getInstance(): EmployeeRepository {
		if (!EmployeeRepository.instance) {
			EmployeeRepository.instance = new EmployeeRepository();
		}
		return EmployeeRepository.instance;
	}

	async findAll(): Promise<Employee[]> {
		return await this.repo.find({ order: { createdAt: "DESC" } });
	}

	async findById(id: string): Promise<Employee | null> {
		return await this.repo.findOneBy({ id });
	}

	async findByCode(code: string): Promise<Employee | null> {
		return await this.repo.findOneBy({ code });
	}

	async findByDocumentNumber(documentNumber: string): Promise<Employee | null> {
		return await this.repo.findOneBy({ documentNumber });
	}

	async save(employee: Employee): Promise<Employee> {
		return await this.repo.save(employee);
	}

	async update(id: string, data: Partial<Employee>): Promise<Employee | null> {
		await this.repo.update(id, data);
		return await this.findById(id);
	}

	async delete(id: string): Promise<boolean> {
		const result = await this.repo.update(id, {
			isActive: false,
			terminationDate: new Date(),
		});
		return (
			result.affected !== null &&
			result.affected !== undefined &&
			result.affected > 0
		);
	}

	async countByRole(role: string): Promise<number> {
		return await this.repo.count({
			where: { role: role as any, isActive: true },
		});
	}
}
