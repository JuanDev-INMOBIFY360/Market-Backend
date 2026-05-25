import { Router } from "express";
import { PromotionController } from "../controllers/Promotion.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class PromotionRoutes {
	private router: Router;
	private promotionController: PromotionController;

	constructor() {
		this.router = Router();
		this.promotionController = new PromotionController();
		this.initRoutes();
	}

	private initRoutes(): void {
		// Rutas públicas
		this.router.get("/active", this.promotionController.getActive);
		this.router.get("/:id", this.promotionController.getById);
		this.router.get("/", this.promotionController.getAll);

		// Rutas protegidas
		this.router.use(AuthMiddleware.verificarToken);
		this.router.use(AuthMiddleware.verificarRol(["admin", "owner"]));

		this.router.post("/", this.promotionController.create);
		this.router.put("/:id", this.promotionController.update);
		this.router.delete("/:id", this.promotionController.delete);
	}

	public getRouter(): Router {
		return this.router;
	}
}
