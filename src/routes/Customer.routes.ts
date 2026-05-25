import { Router } from "express";
import { CustomerController } from "../controllers/Customer.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class CustomerRoutes {
	private router: Router;
	private customerController: CustomerController;

	constructor() {
		this.router = Router();
		this.customerController = new CustomerController();
		this.initRoutes();
	}

	private initRoutes(): void {
		//public
		this.router.post(
			"/",
			AuthMiddleware.verificarToken,
			this.customerController.create,
		);
		this.router.get(
			"/document/:document",
			AuthMiddleware.verificarToken,
			this.customerController.getByDocument,
		);

		//admins or owner
		this.router.get(
			"/",
			AuthMiddleware.verificarToken,
			AuthMiddleware.verificarRol(["admin", "owner"]),
			this.customerController.getAll,
		);

		this.router.get(
			"/:id",
			AuthMiddleware.verificarToken,
			AuthMiddleware.verificarRol(["admin", "owner"]),
			this.customerController.getById,
		);

		this.router.put(
			"/:id",
			AuthMiddleware.verificarToken,
			AuthMiddleware.verificarRol(["admin", "owner"]),
			this.customerController.update,
		);

		this.router.get(
			"/:id/points",
			AuthMiddleware.verificarToken,
			AuthMiddleware.verificarRol(["admin", "owner"]),
			this.customerController.getPointsHistory,
		);

		this.router.post(
			"/:id/points",
			AuthMiddleware.verificarToken,
			AuthMiddleware.verificarRol(["admin", "owner"]),
			this.customerController.addPoints,
		);
	}
	public getRouter(): Router {
		return this.router;
	}
}
