import { Router } from "express";
import { CashShiftController } from "../controllers/CashShift.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class CashShiftRoutes {
	private router: Router;
	private cashShiftController: CashShiftController;

	constructor() {
		this.router = Router();
		this.cashShiftController = new CashShiftController();
		this.initRoutes();
	}

	private initRoutes(): void {
		// Todas las rutas requieren autenticación
		this.router.use(AuthMiddleware.verificarToken);

		this.router.post("/open", this.cashShiftController.open);
		this.router.post("/close", this.cashShiftController.close);
		this.router.get("/current", this.cashShiftController.getCurrent);
		this.router.get(
			"/employee/:employeeId",
			this.cashShiftController.getEmployeeShifts,
		);
		this.router.get("/:id", this.cashShiftController.getById);
	}

	public getRouter(): Router {
		return this.router;
	}
}
