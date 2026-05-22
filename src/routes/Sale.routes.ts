import { Router } from 'express';
import { SaleController } from '../controllers/Sale.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

export class SaleRoutes {
    private router: Router;
    private saleController: SaleController;

    constructor() {
        this.router = Router();
        this.saleController = new SaleController();
        this.initRoutes();
    }

    private initRoutes(): void {
        // Rutas de carrito (requieren autenticación y turno activo)
        this.router.use(AuthMiddleware.verificarToken);
        
        this.router.post('/cart/add', this.saleController.addToCart);
        this.router.delete('/cart/item/:index', this.saleController.removeFromCart);
        this.router.put('/cart/item/:index', this.saleController.updateCartItem);
        this.router.get('/cart', this.saleController.getCart);
        this.router.delete('/cart', this.saleController.clearCart);
        
        this.router.post('/', this.saleController.createSale);
        this.router.get('/', this.saleController.getAllSales);
        this.router.get('/:id', this.saleController.getSaleById);
        
        // Cancelación solo admin
        this.router.post('/:id/cancel', 
            AuthMiddleware.verificarRol(['admin', 'owner']),
            this.saleController.cancelSale
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}