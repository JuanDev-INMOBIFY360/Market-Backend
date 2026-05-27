import type { Request, Response } from "express";
import { ConfigService } from "../services/Config.service";

export class ConfigController {
	private configService: ConfigService;

	constructor() {
		this.configService = new ConfigService();
	}

	getAllConfig = async (_req: Request, res: Response): Promise<void> => {
		try {
			const config = await this.configService.getAllConfigs();
			res.status(200).json({
				message: "Configuración obtenida extiosamente",
				config,
			});
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	getConfigByKey = async (req: Request, res: Response): Promise<void> => {
		try {
			const key = req.params.key as string;
			const config = await this.configService.getConfig(key);

			if (!config) {
				res.status(404).json({ error: `Configuración '${key}' no encontrada` });
				return;
			}

			res.status(200).json({
				message: "Configuración obtenida exitosamente",
				config,
			});
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	updatedConfig = async (req: Request, res: Response): Promise<void> => {
		try {
			const key = req.params.key as string;
			const { value } = req.body;
			if (!value && value !== "") {
				res.status(400).json({ error: " el valor es requerido" });
				return;
			}
			const updated = await this.configService.updateConfig(key, value);
			if (!updated) {
				res.status(404).json({ error: `Configuración '${key}' no encontrada` });
				return;
			}
			res.status(200).json({
				message: "Configuración actualizada exitosamente",
				config: updated,
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};
}
