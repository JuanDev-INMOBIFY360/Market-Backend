// src/routes/Employee.routes.ts
import { Router } from 'express';
import { EmployeeController } from '../controllers/Employee.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

export class EmployeeRoutes {
    private router: Router;
    private employeeController: EmployeeController;

    constructor() {
        this.router = Router();
        this.employeeController = new EmployeeController();
        this.initRoutes();
    }

    private initRoutes(): void {
        // Rutas públicas
        this.router.post('/login', this.employeeController.login);
        
        // Rutas protegidas (requieren token)
        this.router.get('/profile', 
            AuthMiddleware.verificarToken, 
            this.employeeController.getProfile
        );
        
        this.router.post('/', 
            // AuthMiddleware.verificarToken,
            // AuthMiddleware.verificarRol(['admin', 'owner']),
            this.employeeController.create
        );
        
        this.router.get('/', 
            AuthMiddleware.verificarToken,
            AuthMiddleware.verificarRol(['admin', 'owner']),
            this.employeeController.getAll
        );
        
        this.router.get('/:id', 
            AuthMiddleware.verificarToken,
            AuthMiddleware.verificarRol(['admin', 'owner']),
            this.employeeController.getById
        );
        
        this.router.put('/:id', 
            AuthMiddleware.verificarToken,
            AuthMiddleware.verificarRol(['admin', 'owner']),
            this.employeeController.update
        );
        
        this.router.delete('/:id', 
            AuthMiddleware.verificarToken,
            AuthMiddleware.verificarRol(['admin', 'owner']),
            this.employeeController.delete
        );
        
        this.router.post('/:id/change-password', 
            AuthMiddleware.verificarToken,
            this.employeeController.changePassword
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}