import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { appDataSource } from './config/database.config';
import { ConfigRoutes } from './routes/Config.routes';
import { ConfigService } from './services/Config.service';
import { EmployeeRoutes } from './routes/Employee.routes';
import { CashShiftRoutes } from './routes/CashShift.routes';
import { CategoryRoutes } from './routes/Category.routes';
import { ProductRoutes } from './routes/Product.routes';
import { SupplierRoutes } from './routes/Supplier.routes'
import { PurchaseRoutes } from './routes/Purchase.routes';
import { SaleRoutes } from './routes/Sale.routes';
import { CustomerRoutes } from './routes/Customer.routes';





dotenv.config();

class Server {
    private app: Application;
    private port: number;

    constructor() {
        this.app = express();
        this.port = parseInt(process.env.PORT || '3000', 10);
        this.connectedDatabase()
        this.middleware();
        this.routes();
    }

    private middleware(): void {
        this.app.use(cors());
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
        const customerRoutes  = new CustomerRoutes();

        this.app.use('/config', configRoutes.getRouter())
        this.app.use('/employees', employeeRoutes.getRouter());
        this.app.use('/shifts', cashShiftRoutes.getRouter())
        this.app.use('/categories', categoryRoutes.getRouter())
        this.app.use('/products', productRoutes.getRouter());
        this.app.use('/suppliers', supplierRoutes.getRouter());
        this.app.use('/purchases', purchaseRoutes.getRouter());
        this.app.use('/sales', saleRoutes.getRouter());
        this.app.use('/customers', customerRoutes.getRouter());


        this.app.use
        this.app.get('/health', (req: Request, res: Response) => {
            res.json({
                status: 'ok',
                message: 'Supermercado API funcionando',
                timestamp: new Date().toISOString()
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
            await appDataSource.initialize()
            const configService = new ConfigService()
            await configService.initConfig()
            console.log(' Configuraciones por defecto inicializadas');
            console.log('Postgres conectado')
        } catch (error) {
            console.error(error);
            throw new Error('Error al conectar la base de datos')
        }
    }
}

const server = new Server();
server.listen();