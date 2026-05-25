import { error } from "node:console";
import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { PurchaseService } from "../services/Purchase.service";

export class PurchaseController {
	private purchasaService: PurchaseService;

	constructor() {
		this.purchasaService = new PurchaseService();
	}

	create = async (req: AuthRequest, res: Response): Promise<void> => {
		try {
			const employeeId = req.user?.id;
			if (!employeeId) {
				res.status(401).json({ error: "no autenticado" });
				return;
			}
			const { supplierId, invoiceNumber, items, notes } = req.body;
			if (!supplierId || !invoiceNumber || !items || items.length === 0) {
				res.status(400).json({
					error: "Faltan campos requeridos: supplierId, invoiceNumber, items",
				});
				return;
			}
			const purchase = await this.purchasaService.createPurchase(
				supplierId,
				invoiceNumber,
				employeeId,
				items,
				notes,
			);
			res.status(200).json({
				message: "compra creada exitosamente",
				purchase: purchase.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	getAll = async (req: Request, res: Response): Promise<void> => {
		try {
			const purchases = await this.purchasaService.getAllPurcharses();
			res.status(200).json({
				message: "Lista de ventas",
				purchases: purchases.map((p) => p.toJSON()),
			});
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	getById = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as string;
			const purchase = await this.purchasaService.getPurcharseById(id);
			res.status(200).json({
				purchase: purchase.toJSON(),
			});
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	};

	update = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as string;
			const { notes } = req.body;

			const purchase = await this.purchasaService.updatePurchase(id, { notes });
			res.status(200).json({
				message: "Compra actualizada exitosamente",
				purchase: purchase.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	confirm = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as string;
			const purchase = await this.purchasaService.confirmPurchase(id);
			res.status(200).json({
				message: "Compra confirmada y stock actualizado",
				purchase: purchase.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};
	cancel = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as string;
			const purchase = await this.purchasaService.cancelPurchase(id);

			res.status(200).json({
				message: "Compra cancelada exitosamente",
				purchase: purchase.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};
}
