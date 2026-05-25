import { Router } from "express";
import { CashMovementController } from "../controllers/CashMovement.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class CashMovementRoutes {
	private router: Router;
	private cashMovementController: CashMovementController;

	constructor() {
		this.router = Router();
		this.cashMovementController = new CashMovementController();
		this.initRoutes();
	}

	private initRoutes(): void {
		this.router.use(AuthMiddleware.verificarToken);

		this.router.post(
			"/expense",
			AuthMiddleware.verificarRol(["admin", "owner"]),
			this.cashMovementController.registerExpense,
		);

		this.router.post(
			"/income",
			AuthMiddleware.verificarRol(["admin", "owner"]),
			this.cashMovementController.registerIncome,
		);

		this.router.post(
			"/withdrawal",
			AuthMiddleware.verificarRol(["owner"]),
			this.cashMovementController.registerWithdrawal,
		);

		this.router.get(
			"/movements/:shiftId",
			AuthMiddleware.verificarRol(["admin", "owner"]),
			this.cashMovementController.getShiftMovements,
		);

		this.router.get(
			"/summary/:shiftId",
			AuthMiddleware.verificarRol(["admin", "owner"]),
			this.cashMovementController.getShiftSummary,
		);
	}

	public getRouter(): Router {
		return this.router;
	}
}
