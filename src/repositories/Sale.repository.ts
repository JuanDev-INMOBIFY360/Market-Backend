// src/repositories/Sale.repository.ts

import type { Repository } from "typeorm";
import { appDataSource } from "../config/database.config";
import { Sale } from "../models/Sale.model";

export class SaleRepository {
	private static instance: SaleRepository;
	private repo: Repository<Sale>;

	private constructor() {
		this.repo = appDataSource.getRepository(Sale);
	}

	public static getInstance(): SaleRepository {
		if (!SaleRepository.instance) {
			SaleRepository.instance = new SaleRepository();
		}
		return SaleRepository.instance;
	}

	async findNextSaleNumber(): Promise<string> {
		const lastSale = await this.repo.find({
			order: { saleDate: "DESC" },
			take: 1,
		});

		const sale = lastSale[0];

		if (!sale?.saleNumber) {
			return "0001";
		}

		const lastNumber = parseInt(sale.saleNumber, 10);
		return (lastNumber + 1).toString().padStart(4, "0");
	}

	async save(sale: Sale): Promise<Sale> {
		return await this.repo.save(sale);
	}

	async findAll(): Promise<Sale[]> {
		return await this.repo.find({
			relations: ["employee", "customer", "items", "items.product"],
			order: { saleDate: "DESC" },
		});
	}

	async findById(id: string): Promise<Sale | null> {
		return await this.repo.findOne({
			where: { id },
			relations: ["employee", "customer", "items", "items.product"],
		});
	}

	async findByCashShift(cashShiftId: string): Promise<Sale[]> {
		return await this.repo.find({
			where: { cashShiftId },
			relations: ["items", "items.product"],
		});
	}

	async update(id: string, data: Partial<Sale>): Promise<Sale | null> {
		await this.repo.update(id, data);
		return await this.findById(id);
	}
}
