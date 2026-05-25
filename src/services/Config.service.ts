import type { Config } from "../models/Config.model";
import { ConfigRepository } from "../repositories/Config.repository";

export class ConfigService {
	private configRepository: ConfigRepository;
	constructor() {
		this.configRepository = ConfigRepository.getInstance();
	}

	async initConfig(): Promise<void> {
		return await this.configRepository.initDefaultConfigs();
	}

	async getAllConfigs(): Promise<Config[]> {
		return this.configRepository.findAll();
	}

	async getConfig(key: string): Promise<Config | null> {
		return await this.configRepository.findByKey(key);
	}

	async getValue(key: string, defaultValue?: string): Promise<string | null> {
		return await this.configRepository.getValue(key, defaultValue);
	}

	async updateConfig(
		key: string,
		value: string,
		updatedBy?: string,
	): Promise<Config | null> {
		await this.validateConfig(key, value);
		return await this.configRepository.update(key, value, updatedBy);
	}

	private async validateConfig(key: string, value: string): Promise<void> {
		switch (key) {
			case "mode":
				if (value !== "simple" && value !== "enterprise") {
					throw new Error('El modo debe ser "simple" o "enterprise"');
				}
				break;
			case "iva_general":
			case "consumption_tax":
			case "points_percentage": {
				const num = parseFloat(value);
				if (isNaN(num) || num < 0 || num > 100) {
					throw new Error(`${key} debe ser un número entre 0 y 100`);
				}
				break;
			}
			case "point_value": {
				const val = parseFloat(value);
				if (isNaN(val) || val <= 0) {
					throw new Error("El valor del punto debe ser mayor a 0");
				}
				break;
			}
			case "points_enabled":
			case "electronic_invoice":
			case "cashier_shifts":
				if (value !== "true" && value !== "false") {
					throw new Error(`${key} debe ser "true" o "false"`);
				}
				break;
		}
	}
}
