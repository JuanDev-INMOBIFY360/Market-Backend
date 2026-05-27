import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { AuditLogService } from "../services/AuditLog.service";

export class AuditLogController {
	private auditLogService = new AuditLogService();

	getAll = async (req: AuthRequest, res: Response): Promise<void> => {
		try {
			const page = parseInt(req.query.page as string, 10) || 1;
			const limit = parseInt(req.query.limit as string, 10) || 100;

			const result = await this.auditLogService.getAllLogs(page, limit);
			res.status(200).json(result);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	getByEntity = async (req: Request, res: Response): Promise<void> => {
		try {
			const entityId = req.params.entityId as string;
			const entity = req.params.entity as string;
			const logs = await this.auditLogService.getLogsByEntity(entity, entityId);
			res.status(200).json({ logs });
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	getByEmployee = async (req: Request, res: Response): Promise<void> => {
		try {
			const employeeId = req.params.employeeId as string;
			const logs = await this.auditLogService.getLogsByEmployee(employeeId);
			res.status(200).json({ logs });
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	getByDateRange = async (req: Request, res: Response): Promise<void> => {
		try {
			const { start, end } = req.query;
			const startDate = new Date(start as string);
			const endDate = new Date(end as string);
			endDate.setHours(23, 59, 59, 999);

			const logs = await this.auditLogService.getLogsByDateRange(
				startDate,
				endDate,
			);
			res.status(200).json({ logs });
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};
}
