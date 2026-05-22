import { Router } from 'express';
import { BackupController } from '../controllers/Backup.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

export class BackupRoutes {
    private router: Router;
    private backupController: BackupController;

    constructor() {
        this.router = Router();
        this.backupController = new BackupController();
        this.initRoutes();
    }

    private initRoutes(): void {
        // Todas las rutas requieren autenticación y rol admin/owner
        this.router.use(AuthMiddleware.verificarToken);
        this.router.use(AuthMiddleware.verificarRol(['admin', 'owner']));

        this.router.post('/create', this.backupController.createBackup);
        this.router.post('/create-full', this.backupController.createFullBackup);
        this.router.get('/list', this.backupController.listBackups);
        this.router.post('/restore/:filename', this.backupController.restoreBackup);
        this.router.delete('/:filename', this.backupController.deleteBackup);
    }

    public getRouter(): Router {
        return this.router;
    }
}
