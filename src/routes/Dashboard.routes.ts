import { Router } from 'express';
import { DashboardController } from '../controllers/Dashboard.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

export class DashboardRoutes {
    private router: Router;
    private dashboardController: DashboardController;

    constructor() {
        this.router = Router();
        this.dashboardController = new DashboardController();
        this.initRoutes();
    }

    private initRoutes(): void {
        // Todas las rutas requieren autenticación y rol admin/owner
        this.router.use(AuthMiddleware.verificarToken);
        this.router.use(AuthMiddleware.verificarRol(['admin', 'owner']));

        this.router.get('/today-sales', this.dashboardController.getTodaySales);
        this.router.get('/month-sales', this.dashboardController.getMonthSales);
        this.router.get('/low-stock', this.dashboardController.getLowStock);
        this.router.get('/active-shifts', this.dashboardController.getActiveShifts);
        this.router.get('/sales-by-hour', this.dashboardController.getSalesByHour);
        this.router.get('/payment-methods', this.dashboardController.getPaymentMethods);
        this.router.get('/top-products', this.dashboardController.getTopProducts);
    }

    public getRouter(): Router {
        return this.router;
    }
}