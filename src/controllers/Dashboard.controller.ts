import { Request, Response } from 'express';
import { DashboardService } from '../services/Dashboard.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class DashboardController {
    private dashboardService: DashboardService;

    constructor() {
        this.dashboardService = new DashboardService();
    }

    
    getTodaySales = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const data = await this.dashboardService.getTodaySales();
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    
    getMonthSales = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const data = await this.dashboardService.getMonthSales();
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    
    getLowStock = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const data = await this.dashboardService.getLowStockCount();
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

  
    getActiveShifts = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const data = await this.dashboardService.getActiveShifts();
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

   
    getSalesByHour = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const data = await this.dashboardService.getSalesByHour();
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    
    getPaymentMethods = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const data = await this.dashboardService.getPaymentMethods();
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

   
    getTopProducts = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const limit = parseInt(req.query.limit as string) || 5;
            const data = await this.dashboardService.getTopProductsToday(limit);
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };
}