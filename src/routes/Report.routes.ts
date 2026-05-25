// src/routes/Report.routes.ts
import { Router } from "express";
import { ReportController } from "../controllers/Report.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class ReportRoutes {
	private router: Router;
	private reportController: ReportController;

	constructor() {
		this.router = Router();
		this.reportController = new ReportController();
		this.initRoutes();
	}

	private initRoutes(): void {
		// Todas las rutas requieren autenticación y rol admin/owner
		this.router.use(AuthMiddleware.verificarToken);
		this.router.use(AuthMiddleware.verificarRol(["admin", "owner"]));

		this.router.get("/sales/daily", this.reportController.getDailySales);
		this.router.get("/sales/period", this.reportController.getSalesByPeriod);
		this.router.get("/products/top", this.reportController.getTopProducts);
		this.router.get("/products/low-stock", this.reportController.getLowStock);
		this.router.get(
			"/employees/performance",
			this.reportController.getEmployeePerformance,
		);
		this.router.get("/profit", this.reportController.getGrossProfit);
		this.router.get("/taxes", this.reportController.getTaxReport);
	}

	public getRouter(): Router {
		return this.router;
	}
}
