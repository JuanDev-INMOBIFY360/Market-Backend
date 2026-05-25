import type { Repository } from "typeorm";
import { appDataSource } from "../config/database.config";
import { PointsHistory } from "../models/PointsHistory.model";

export class PointsHistoryRepository {
	private static instance: PointsHistoryRepository;
	private repo: Repository<PointsHistory>;

	constructor() {
		this.repo = appDataSource.getRepository(PointsHistory);
	}

	public static getInstance(): PointsHistoryRepository {
		if (!PointsHistoryRepository.instance) {
			PointsHistoryRepository.instance = new PointsHistoryRepository();
		}
		return PointsHistoryRepository.instance;
	}

	async save(history: PointsHistory): Promise<PointsHistory> {
		return await this.save(history);
	}

	async findByCustomer(customerId: string): Promise<PointsHistory[]> {
		return await this.repo.find({
			where: { customerId },
			order: { createdAt: "DESC" },
		});
	}

	async getPointsBalance(customerId: string): Promise<number> {
		const earned =
			(await this.repo.sum("points", { customerId, type: "earned" })) || 0;
		const redeemed =
			(await this.repo.sum("points", { customerId, type: "redeemed" })) || 0;
		return earned - redeemed;
	}
}
