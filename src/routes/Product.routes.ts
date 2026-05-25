import { Router } from "express";
import { ProductController } from "../controllers/Product.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class ProductRoutes {
	private router: Router;
	private productController: ProductController;

	constructor() {
		this.router = Router();
		this.productController = new ProductController();
		this.initRoutes();
	}

	private initRoutes(): void {
		// Rutas públicas (solo consulta)
		this.router.get("/search", this.productController.search);
		this.router.get("/barcode/:barcode", this.productController.getByBarcode);
		this.router.get("/low-stock", this.productController.getLowStock);
		this.router.get("/out-of-stock", this.productController.getOutOfStock);
		this.router.get("/:id", this.productController.getById);
		this.router.get("/", this.productController.getAll);

		// Rutas protegidas (requieren autenticación)
		this.router.post(
			"/",
			AuthMiddleware.verificarToken,
			AuthMiddleware.verificarRol(["admin", "warehouse"]),
			this.productController.create,
		);

		this.router.put(
			"/:id",
			AuthMiddleware.verificarToken,
			AuthMiddleware.verificarRol(["admin", "warehouse"]),
			this.productController.update,
		);

		this.router.patch(
			"/:id/stock",
			AuthMiddleware.verificarToken,
			AuthMiddleware.verificarRol(["admin", "warehouse"]),
			this.productController.adjustStock,
		);

		this.router.patch(
			"/:id/toggle",
			AuthMiddleware.verificarToken,
			AuthMiddleware.verificarRol(["admin", "warehouse"]),
			this.productController.toggle,
		);

		this.router.delete(
			"/:id",
			AuthMiddleware.verificarToken,
			AuthMiddleware.verificarRol(["admin", "warehouse"]),
			this.productController.delete,
		);
	}

	public getRouter(): Router {
		return this.router;
	}
}
