import { Request, Response } from 'express';
import { PromotionService } from '../services/Promotion.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class PromotionController {
    private promotionService: PromotionService;

    constructor() {
        this.promotionService = new PromotionService();
    }

    create = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const {
                name, type, startDate, endDate, description,
                productId, categoryId, value, minPurchase,
                buyQuantity, getQuantity, weekdays
            } = req.body;

            if (!name || !type || !startDate || !endDate) {
                res.status(400).json({ error: 'Faltan campos requeridos' });
                return;
            }

            const promotion = await this.promotionService.createPromotion({
                name, type, startDate: new Date(startDate), endDate: new Date(endDate),
                description, productId, categoryId, value, minPurchase,
                buyQuantity, getQuantity, weekdays
            });

            res.status(201).json({
                message: 'Promoción creada exitosamente',
                promotion: promotion.toJSON()
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const promotions = await this.promotionService.getAllPromotions();
            res.status(200).json({
                promotions: promotions.map(p => p.toJSON())
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    getActive = async (req: Request, res: Response): Promise<void> => {
        try {
            const promotions = await this.promotionService.getActivePromotions();
            res.status(200).json({
                promotions: promotions.map(p => p.toJSON())
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id  = req.params.id as string;
            const promotion = await this.promotionService.getPromotionById(id);
            res.status(200).json({
                promotion: promotion.toJSON()
            });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const  id  = req.params.id as string;
            const { name, description, value, minPurchase, startDate, endDate, isActive } = req.body;

            const promotion = await this.promotionService.updatePromotion(id, {
                name, description, value, minPurchase,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                isActive
            });

            res.status(200).json({
                message: 'Promoción actualizada exitosamente',
                promotion: promotion.toJSON()
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const id  = req.params.id as string;
            await this.promotionService.deletePromotion(id);
            res.status(200).json({ message: 'Promoción eliminada exitosamente' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}