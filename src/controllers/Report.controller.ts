// src/controllers/Report.controller.ts
import type { Request, Response } from "express";
import { ReportService } from "../services/Report.service";

export class ReportController {
	private reportService: ReportService;

	constructor() {
		this.reportService = new ReportService();
	}

	// GET /reports/sales/daily
	getDailySales = async (_req: Request, res: Response): Promise<void> => {
		try {
			const report = await this.reportService.getDailySales();
			res.status(200).json(report);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	// GET /reports/sales/period?start=YYYY-MM-DD&end=YYYY-MM-DD
	getSalesByPeriod = async (req: Request, res: Response): Promise<void> => {
		try {
			const { start, end } = req.query;
			const startDate = new Date(start as string);
			const endDate = new Date(end as string);
			endDate.setHours(23, 59, 59, 999);

			const report = await this.reportService.getSalesByPeriod(
				startDate,
				endDate,
			);
			res.status(200).json(report);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	// GET /reports/products/top?limit=10
	getTopProducts = async (req: Request, res: Response): Promise<void> => {
		try {
			const limit = parseInt(req.query.limit as string, 10) || 10;
			const { start, end } = req.query;
			const startDate = start ? new Date(start as string) : undefined;
			const endDate = end ? new Date(end as string) : undefined;
			if (endDate) endDate.setHours(23, 59, 59, 999);

			const report = await this.reportService.getTopProducts(
				limit,
				startDate,
				endDate,
			);
			res.status(200).json(report);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	// GET /reports/products/low-stock
	getLowStock = async (_req: Request, res: Response): Promise<void> => {
		try {
			const report = await this.reportService.getLowStockProducts();
			res.status(200).json(report);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	// GET /reports/employees/performance
	getEmployeePerformance = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		try {
			const { start, end } = req.query;
			const startDate = start ? new Date(start as string) : undefined;
			const endDate = end ? new Date(end as string) : undefined;
			if (endDate) endDate.setHours(23, 59, 59, 999);

			const report = await this.reportService.getEmployeePerformance(
				startDate,
				endDate,
			);
			res.status(200).json(report);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	getGrossProfit = async (req: Request, res: Response): Promise<void> => {
		try {
			const { start, end } = req.query;
			const startDate = start ? new Date(start as string) : undefined;
			const endDate = end ? new Date(end as string) : undefined;
			if (endDate) endDate.setHours(23, 59, 59, 999);

			const report = await this.reportService.getGrossProfit(
				startDate,
				endDate,
			);
			res.status(200).json(report);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	// GET /reports/taxes
	getTaxReport = async (req: Request, res: Response): Promise<void> => {
		try {
			const { start, end } = req.query;
			const startDate = start ? new Date(start as string) : undefined;
			const endDate = end ? new Date(end as string) : undefined;
			if (endDate) endDate.setHours(23, 59, 59, 999);

			const report = await this.reportService.getTaxReport(startDate, endDate);
			res.status(200).json(report);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};
}
