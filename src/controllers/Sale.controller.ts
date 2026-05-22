import { Request, Response } from 'express';
import { SaleService } from '../services/Sale.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class SaleController {
    private saleService: SaleService;

    constructor() {
        this.saleService = new SaleService();
    }

    addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const shiftId = req.user?.shiftId;
            if (!shiftId) {
                res.status(400).json({ error: 'No hay turno activo' });
                return;
            }

            const { productId, quantity } = req.body;
            if (!productId || !quantity || quantity <= 0) {
                res.status(400).json({ error: 'Producto y cantidad son requeridos' });
                return;
            }

            const cart = await this.saleService.addToCart(shiftId, productId, quantity);
            res.status(200).json({ cart });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const shiftId = req.user?.shiftId;
            if (!shiftId) {
                res.status(400).json({ error: 'No hay turno activo' });
                return;
            }

            const  index  = req.params.index as string;
            const cart = await this.saleService.removeFromCart(shiftId, parseInt(index));
            res.status(200).json({ cart });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const shiftId = req.user?.shiftId;
            if (!shiftId) {
                res.status(400).json({ error: 'No hay turno activo' });
                return;
            }

            const  index  = req.params.index as string;
            const { quantity } = req.body;
            const cart = await this.saleService.updateCartItem(shiftId, parseInt(index), quantity);
            res.status(200).json({ cart });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getCart = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const shiftId = req.user?.shiftId;
            if (!shiftId) {
                res.status(400).json({ error: 'No hay turno activo' });
                return;
            }

            const cart = await this.saleService.getCartItems(shiftId);
            res.status(200).json(cart);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const shiftId = req.user?.shiftId;
            if (!shiftId) {
                res.status(400).json({ error: 'No hay turno activo' });
                return;
            }

            await this.saleService.clearCart(shiftId);
            res.status(200).json({ message: 'Carrito vaciado' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    createSale = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const shiftId = req.user?.shiftId;
            const employeeId = req.user?.id;
            if (!shiftId || !employeeId) {
                res.status(400).json({ error: 'No hay turno activo' });
                return;
            }

            const { paymentMethod, cashReceived, customerId, customerName, customerDocument } = req.body;

            if (!paymentMethod) {
                res.status(400).json({ error: 'Método de pago es requerido' });
                return;
            }

            const sale = await this.saleService.createSale(
                shiftId, employeeId, paymentMethod, cashReceived,
                customerId, customerName, customerDocument
            );

            res.status(201).json({
                message: 'Venta realizada exitosamente',
                sale: sale.toJSON()
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getAllSales = async (req: Request, res: Response): Promise<void> => {
        try {
            const sales = await this.saleService.getAllSales();
            res.status(200).json({
                sales: sales.map(s => s.toJSON())
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    getSaleById = async (req: Request, res: Response): Promise<void> => {
        try {
            const  id  = req.params.id as string;
            const sale = await this.saleService.getSaleById(id);
            res.status(200).json({
                sale: sale.toJSON()
            });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    cancelSale = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const  id  = req.params.id as string;
            const { reason } = req.body;
            const adminId = req.user?.id;

            if (!adminId) {
                res.status(401).json({ error: 'No autenticado' });
                return;
            }

            if (!reason) {
                res.status(400).json({ error: 'Motivo de cancelación es requerido' });
                return;
            }

            const sale = await this.saleService.cancelSale(id, adminId, reason);
            res.status(200).json({
                message: 'Venta cancelada exitosamente',
                sale: sale.toJSON()
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}