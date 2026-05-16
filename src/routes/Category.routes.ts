import { Router } from 'express';
import { CategoryController } from '../controllers/Category.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

export class CategoryRoutes {
    private router: Router;
    private categoryController: CategoryController;

    constructor() {
        this.router = Router();
        this.categoryController = new CategoryController();
        this.initRoutes();
    }

    private initRoutes(): void {
        // Rutas públicas (solo lectura)
        this.router.get('/', this.categoryController.getAll);
        this.router.get('/tree', this.categoryController.getTree);
        this.router.get('/:id', this.categoryController.getById);

        // Rutas protegidas (requieren token y rol admin/warehouse)
        this.router.post('/',
            AuthMiddleware.verificarToken,
            AuthMiddleware.verificarRol(['admin', 'warehouse']),
            this.categoryController.create
        );

        this.router.put('/:id',
            AuthMiddleware.verificarToken,
            AuthMiddleware.verificarRol(['admin', 'warehouse']),
            this.categoryController.update
        );

        this.router.delete('/:id',
            AuthMiddleware.verificarToken,
            AuthMiddleware.verificarRol(['admin', 'warehouse']),
            this.categoryController.delete
        );

        this.router.patch('/:id/toggle',
            AuthMiddleware.verificarToken,
            AuthMiddleware.verificarRol(['admin', 'warehouse']),
            this.categoryController.toggle
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}