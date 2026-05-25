import { ILike, type Repository } from "typeorm";
import { appDataSource } from "../config/database.config";
import { Supplier } from "../models/Supplier.model";

export class SupplierRepository {
	private static instace: SupplierRepository;
	private repo: Repository<Supplier>;

	private constructor() {
		this.repo = appDataSource.getRepository(Supplier);
	}

	public static getInstance(): SupplierRepository {
		if (!SupplierRepository.instace) {
			SupplierRepository.instace = new SupplierRepository();
		}
		return SupplierRepository.instace;
	}

	async findAll(): Promise<Supplier[]> {
		return this.repo.find({
			where: { isActive: true },
			order: { name: "ASC" },
		});
	}

	async findAllWithInactive(): Promise<Supplier[]> {
		return this.repo.find({
			order: { name: "ASC" },
		});
	}

	async findById(id: string): Promise<Supplier | null> {
		return this.repo.findOneBy({ id });
	}

	async findByNit(nit: string): Promise<Supplier | null> {
		return this.repo.findOneBy({ nit });
	}

	async searchByName(query: string): Promise<Supplier[]> {
		return await this.repo.find({
			where: { name: ILike(`%${query}%`), isActive: true },
			take: 20,
		});
	}

	async save(supplier: Supplier): Promise<Supplier> {
		return this.repo.save(supplier);
	}

	async update(id: string, data: Partial<Supplier>): Promise<Supplier | null> {
		await this.repo.update(id, data);
		return await this.findById(id);
	}
	async delete(id: string): Promise<boolean> {
		const result = await this.repo.update(id, { isActive: false });
		return (
			result.affected !== null &&
			result.affected !== undefined &&
			result.affected > 0
		);
	}
}
