import type { Repository } from "typeorm";
import { appDataSource } from "../config/database.config";
import { PurchaseItem } from "../models/PurchaseItem.model";

export class PurchaseItemRepository {
	private static instance: PurchaseItemRepository;
	private repo: Repository<PurchaseItem>;

	private constructor() {
		this.repo = appDataSource.getRepository(PurchaseItem);
	}

	public static getInstance(): PurchaseItemRepository {
		if (!PurchaseItemRepository.instance) {
			PurchaseItemRepository.instance = new PurchaseItemRepository();
		}
		return PurchaseItemRepository.instance;
	}

	async save(item: PurchaseItem): Promise<PurchaseItem> {
		return await this.repo.save(item);
	}

	async deleteByPurchaseId(purchaseId: string): Promise<void> {
		await this.repo.delete({ purchaseId });
	}
}
