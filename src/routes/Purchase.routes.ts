import { Router } from "express";
import { PurchaseController } from "../controllers/Purchase.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class PurchaseRoutes {
	private router: Router;
	private purchaseController: PurchaseController;

	constructor() {
		this.router = Router();
		this.purchaseController = new PurchaseController();
		this.initRoutes();
	}

	private initRoutes() {
		this.router.use(AuthMiddleware.verificarToken);
		this.router.use(AuthMiddleware.verificarRol(["admin", "warehouse"]));

		this.router.post("/", this.purchaseController.create);
		this.router.get("/", this.purchaseController.getAll);
		this.router.get("/:id", this.purchaseController.getById);
		this.router.put("/:id", this.purchaseController.update);
		this.router.patch("/:id/confirm", this.purchaseController.confirm);
		this.router.delete("/:id", this.purchaseController.cancel);
	}

	public getRouter(): Router {
		return this.router;
	}
}
