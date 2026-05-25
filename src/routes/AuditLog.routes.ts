import { Router } from "express";
import { AuditLogController } from "../controllers/AuditLog.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class AuditLogRoutes {
	private router: Router;
	private auditLogController: AuditLogController;

	constructor() {
		this.router = Router();
		this.auditLogController = new AuditLogController();
		this.initRoutes();
	}

	private initRoutes(): void {
		// Todas las rutas requieren autenticación y rol owner
		this.router.use(AuthMiddleware.verificarToken);
		this.router.use(AuthMiddleware.verificarRol(["owner"]));

		this.router.get("/", this.auditLogController.getAll);
		this.router.get(
			"/entity/:entity/:entityId",
			this.auditLogController.getByEntity,
		);
		this.router.get(
			"/employee/:employeeId",
			this.auditLogController.getByEmployee,
		);
		this.router.get("/date-range", this.auditLogController.getByDateRange);
	}

	public getRouter(): Router {
		return this.router;
	}
}
