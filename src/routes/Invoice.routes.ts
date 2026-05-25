import { Router } from "express";
import { InvoiceController } from "../controllers/Invoice.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class InvoiceRoutes {
	private router: Router;
	private invoiceController: InvoiceController;

	constructor() {
		this.router = Router();
		this.invoiceController = new InvoiceController();
		this.initRoutes();
	}

	private initRoutes(): void {
		// Todas las rutas requieren autenticación
		this.router.use(AuthMiddleware.verificarToken);

		this.router.get("/ticket/:saleId", this.invoiceController.getTicket);
		this.router.get("/pdf/:saleId", this.invoiceController.getPDF);
		this.router.get("/print/:saleId", this.invoiceController.print);
	}

	public getRouter(): Router {
		return this.router;
	}
}
