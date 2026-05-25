import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { CashMovementService } from "../services/CashMovement.service";

export class CashMovementController {
	private cashMovementService: CashMovementService;

	constructor() {
		this.cashMovementService = new CashMovementService();
	}

	registerExpense = async (req: AuthRequest, res: Response): Promise<void> => {
		try {
			const employeeId = req.user?.id;
			const shiftId = req.user?.shiftId;

			if (!employeeId || !shiftId) {
				res.status(401).json({ error: "No autenticado o no hay turno activo" });
				return;
			}

			const { amount, description, receiptNumber } = req.body;

			if (!amount || !description) {
				res.status(400).json({ error: "Monto y descripción son requeridos" });
				return;
			}

			const movement = await this.cashMovementService.registerExpense(
				shiftId,
				employeeId,
				amount,
				description,
				receiptNumber,
			);

			res.status(201).json({
				message: "Gasto registrado exitosamente",
				movement: movement.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	registerIncome = async (req: AuthRequest, res: Response): Promise<void> => {
		try {
			const employeeId = req.user?.id;
			const shiftId = req.user?.shiftId;

			if (!employeeId || !shiftId) {
				res.status(401).json({ error: "No autenticado o no hay turno activo" });
				return;
			}

			const { amount, description, reference } = req.body;

			if (!amount || !description) {
				res.status(400).json({ error: "Monto y descripción son requeridos" });
				return;
			}

			const movement = await this.cashMovementService.registerIncome(
				shiftId,
				employeeId,
				amount,
				description,
				reference,
			);

			res.status(201).json({
				message: "Ingreso registrado exitosamente",
				movement: movement.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	registerWithdrawal = async (
		req: AuthRequest,
		res: Response,
	): Promise<void> => {
		try {
			const employeeId = req.user?.id;
			const shiftId = req.user?.shiftId;
			const role = req.user?.role;

			if (!employeeId || !shiftId) {
				res.status(401).json({ error: "No autenticado o no hay turno activo" });
				return;
			}

			if (role !== "owner") {
				res
					.status(403)
					.json({ error: "Solo el dueño puede realizar retiros de efectivo" });
				return;
			}

			const { amount, description } = req.body;

			if (!amount || !description) {
				res.status(400).json({ error: "Monto y descripción son requeridos" });
				return;
			}

			const movement = await this.cashMovementService.registerWithdrawal(
				shiftId,
				employeeId,
				amount,
				description,
			);

			res.status(201).json({
				message: "Retiro registrado exitosamente",
				movement: movement.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	getShiftMovements = async (req: Request, res: Response): Promise<void> => {
		try {
			const shiftId = req.params.id as string;
			const movements =
				await this.cashMovementService.getShiftMovements(shiftId);
			res.status(200).json({
				movements: movements.map((m) => m.toJSON()),
			});
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	};

	getShiftSummary = async (req: Request, res: Response): Promise<void> => {
		try {
			const shiftId = req.params.id as string;
			const summary = await this.cashMovementService.getShiftSummary(shiftId);
			res.status(200).json(summary);
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	};
}
