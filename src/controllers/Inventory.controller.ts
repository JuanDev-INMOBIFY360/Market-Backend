import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { InventoryService } from "../services/Inventory.service";

export class InventoryController {
	private inventoryService: InventoryService;

	constructor() {
		this.inventoryService = new InventoryService();
	}

	getKardex = async (req: Request, res: Response): Promise<void> => {
		try {
			const productId = req.params.id as string;
			const movements = await this.inventoryService.getProductKardex(productId);
			res.status(200).json({
				movements: movements.map((m) => m.toJSON()),
			});
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	};

	getLowStock = async (_req: Request, res: Response): Promise<void> => {
		try {
			const products = await this.inventoryService.getLowStockProducts();
			res.status(200).json({ products });
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	getOutOfStock = async (_req: Request, res: Response): Promise<void> => {
		try {
			const products = await this.inventoryService.getOutOfStockProducts();
			res.status(200).json({ products });
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	adjustStock = async (req: AuthRequest, res: Response): Promise<void> => {
		try {
			const employeeId = req.user?.id;
			if (!employeeId) {
				res.status(401).json({ error: "No autenticado" });
				return;
			}

			const { productId, newStock, reason } = req.body;

			if (!productId || newStock === undefined) {
				res
					.status(400)
					.json({ error: "Producto y nuevo stock son requeridos" });
				return;
			}

			if (!reason) {
				res.status(400).json({ error: "El motivo del ajuste es requerido" });
				return;
			}

			const movement = await this.inventoryService.adjustStock(
				productId,
				newStock,
				employeeId,
				reason,
			);
			res.status(200).json({
				message: "Stock ajustado exitosamente",
				movement: movement.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};
}
