import type { Repository } from "typeorm";
import { appDataSource } from "../config/database.config";
import { Category } from "../models/Category.model";

export class CategoryRepository {
	private static instance: CategoryRepository;
	private repo: Repository<Category>;

	private constructor() {
		this.repo = appDataSource.getRepository(Category);
	}

	public static getInstance(): CategoryRepository {
		if (!CategoryRepository.instance) {
			CategoryRepository.instance = new CategoryRepository();
		}
		return CategoryRepository.instance;
	}

	async findAll(): Promise<Category[]> {
		return await this.repo.find({
			order: { displayOrder: "ASC", name: "ASC" },
		});
	}

	async findAllActive(): Promise<Category[]> {
		return await this.repo.find({
			where: { isActive: true },
			order: { displayOrder: "ASC", name: "ASC" },
		});
	}

	async findById(id: string): Promise<Category | null> {
		return await this.repo.findOne({ where: { id } });
	}

	async findByName(name: string, parentId?: string): Promise<Category | null> {
		const where: any = { name };
		if (parentId) {
			where.parentId = parentId;
		} else {
			where.parentId = null;
		}
		return await this.repo.findOne({ where });
	}

	async save(category: Category): Promise<Category> {
		return await this.repo.save(category);
	}

	async update(id: string, data: Partial<Category>): Promise<Category | null> {
		await this.repo.update(id, data);
		return await this.findById(id);
	}

	async delete(id: string): Promise<boolean> {
		const result = await this.repo.delete(id);
		return (
			result.affected !== null &&
			result.affected !== undefined &&
			result.affected > 0
		);
	}

	async hasProducts(id: string): Promise<boolean> {
		//falta poner los productos
		return false;
	}

	async getTree(): Promise<Category[]> {
		const all = await this.repo.find({
			where: { isActive: true },
			order: { displayOrder: "ASC", name: "ASC" },
		});
		return this.buildTree(all, null);
	}

	private buildTree(categories: Category[], parentId: string | null): any[] {
		const result: any[] = [];
		for (const cat of categories) {
			if (cat.parentId === parentId) {
				const children = this.buildTree(categories, cat.id);
				result.push({
					...cat.toJSON(),
					children,
				});
			}
		}
		return result;
	}
}
