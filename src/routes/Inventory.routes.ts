import { Router } from 'express';
import { InventoryController } from '../controllers/Inventory.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

export class InventoryRoutes {
    private router: Router;
    private inventoryController: InventoryController;

    constructor() {
        this.router = Router();
        this.inventoryController = new InventoryController();
        this.initRoutes();
    }

    private initRoutes(): void {
        // Rutas públicas (solo consulta)
        this.router.get('/low-stock', this.inventoryController.getLowStock);
        this.router.get('/out-of-stock', this.inventoryController.getOutOfStock);
        this.router.get('/product/:productId', this.inventoryController.getKardex);

        // Rutas protegidas (solo admin/warehouse)
        this.router.post('/adjust',
            AuthMiddleware.verificarToken,
            AuthMiddleware.verificarRol(['admin', 'warehouse']),
            this.inventoryController.adjustStock
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}