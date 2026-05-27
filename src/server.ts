import cors from "cors";
import dotenv from "dotenv";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import { appDataSource } from "./config/database.config";
import { AuditLogRoutes } from "./routes/AuditLog.routes";
import { BackupRoutes } from "./routes/Backup.routes";
import { CashMovementRoutes } from "./routes/CashMovement.routes";
import { CashShiftRoutes } from "./routes/CashShift.routes";
import { CategoryRoutes } from "./routes/Category.routes";
import { ConfigRoutes } from "./routes/Config.routes";
import { CustomerRoutes } from "./routes/Customer.routes";
import { DashboardRoutes } from "./routes/Dashboard.routes";
import { EmployeeRoutes } from "./routes/Employee.routes";
import { InventoryRoutes } from "./routes/Inventory.routes";
import { InvoiceRoutes } from "./routes/Invoice.routes";
import { ProductRoutes } from "./routes/Product.routes";
import { PromotionRoutes } from "./routes/Promotion.routes";
import { PurchaseRoutes } from "./routes/Purchase.routes";
import { ReportRoutes } from "./routes/Report.routes";
import { SaleRoutes } from "./routes/Sale.routes";
import { SupplierRoutes } from "./routes/Supplier.routes";
import { ConfigService } from "./services/Config.service";

dotenv.config();

class Server {
	private app: Application;
	private port: number;

	constructor() {
		this.app = express();
		this.port = parseInt(process.env.PORT || "3000", 10);
		this.connectedDatabase();
		this.middleware();
		this.routes();
	}

	private middleware(): void {
		this.app.use(cors({
			origin: "http://localhost:5173",
			methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials:true
		}));
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true }));
	}

	private routes(): void {
		const configRoutes = new ConfigRoutes();
		const employeeRoutes = new EmployeeRoutes();
		const cashShiftRoutes = new CashShiftRoutes();
		const categoryRoutes = new CategoryRoutes();
		const productRoutes = new ProductRoutes();
		const supplierRoutes = new SupplierRoutes();
		const purchaseRoutes = new PurchaseRoutes();
		const saleRoutes = new SaleRoutes();
		const customerRoutes = new CustomerRoutes();
		const promotionRoutes = new PromotionRoutes();
		const inventoryRoutes = new InventoryRoutes();
		const invoiceRoutes = new InvoiceRoutes();
		const reportRoutes = new ReportRoutes();
		const dashboardRoutes = new DashboardRoutes();
		const auditLogRoutes = new AuditLogRoutes();
		const backupRoutes = new BackupRoutes();
		const cashMovementRoutes = new CashMovementRoutes();

		this.app.use("/config", configRoutes.getRouter());
		this.app.use("/employees", employeeRoutes.getRouter());
		this.app.use("/shifts", cashShiftRoutes.getRouter());
		this.app.use("/categories", categoryRoutes.getRouter());
		this.app.use("/products", productRoutes.getRouter());
		this.app.use("/suppliers", supplierRoutes.getRouter());
		this.app.use("/purchases", purchaseRoutes.getRouter());
		this.app.use("/sales", saleRoutes.getRouter());
		this.app.use("/customers", customerRoutes.getRouter());
		this.app.use("/promotions", promotionRoutes.getRouter());
		this.app.use("/inventory", inventoryRoutes.getRouter());
		this.app.use("/invoice", invoiceRoutes.getRouter());
		this.app.use("/reports", reportRoutes.getRouter());
		this.app.use("/dashboard", dashboardRoutes.getRouter());
		this.app.use("/audit", auditLogRoutes.getRouter());
		this.app.use("/backup", backupRoutes.getRouter());
		this.app.use("/cash", cashMovementRoutes.getRouter());

		this.app.use;
		this.app.get("/health", (req: Request, res: Response) => {
			res.json({
				status: "ok",
				message: "Supermercado API funcionando",
				timestamp: new Date().toISOString(),
			});
		});
	}

	public listen(): void {
		this.app.listen(this.port, () => {
			console.log(` Servidor corriendo en http://localhost:${this.port}`);
			console.log(` Health: http://localhost:${this.port}/health`);
		});
	}

	private async connectedDatabase(): Promise<void> {
		try {
			await appDataSource.initialize();
			const configService = new ConfigService();
			await configService.initConfig();
			console.log(" Configuraciones por defecto inicializadas");
			console.log("Postgres conectado");
		} catch (error) {
			console.error(error);
			throw new Error("Error al conectar la base de datos");
		}
	}
}

const server = new Server();
server.listen();
