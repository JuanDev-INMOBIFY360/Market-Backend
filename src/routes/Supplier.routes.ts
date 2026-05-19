import { Router } from 'express';
import { SupplierController } from '../controllers/Supplier.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

export class SupplierRoutes {
    private router: Router;
    private supplierController: SupplierController;

    constructor() {
        this.router = Router();
        this.supplierController = new SupplierController();
        this.initRoutes();
    }

    private initRoutes(): void {
        // Rutas públicas (solo consulta)
        this.router.get('/', this.supplierController.getAll);
        this.router.get('/:id', this.supplierController.getById);

        // Rutas protegidas (requieren autenticación y rol admin/warehouse)
        this.router.post('/',
            AuthMiddleware.verificarToken,
            AuthMiddleware.verificarRol(['admin', 'warehouse']),
            this.supplierController.create
        );

        this.router.put('/:id',
            AuthMiddleware.verificarToken,
            AuthMiddleware.verificarRol(['admin', 'warehouse']),
            this.supplierController.update
        );

        this.router.delete('/:id',
            AuthMiddleware.verificarToken,
            AuthMiddleware.verificarRol(['admin', 'warehouse']),
            this.supplierController.delete
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}