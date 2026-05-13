import { Request, Response } from 'express';
import { CashShiftService } from '../services/CashShift.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class CashShiftController {
    private cashShiftService: CashShiftService;

    constructor() {
        this.cashShiftService = new CashShiftService();
    }

    open = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const employeeId = req.user?.id;
            if (!employeeId) {
                res.status(401).json({ error: 'No autenticado' });
                return;
            }

            const { openingBalance } = req.body;
            if (openingBalance === undefined) {
                res.status(400).json({ error: 'El monto inicial es requerido' });
                return;
            }

            const shift = await this.cashShiftService.openShift(employeeId, openingBalance);
            res.status(201).json({
                message: 'Turno abierto exitosamente',
                shift: shift.toJSON()
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    close = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const employeeId = req.user?.id;
            if (!employeeId) {
                res.status(401).json({ error: 'No autenticado' });
                return;
            }

            const { closingBalance, notes } = req.body;
            if (closingBalance === undefined) {
                res.status(400).json({ error: 'El monto final es requerido' });
                return;
            }

            const shift = await this.cashShiftService.closeShift(employeeId, closingBalance, notes);
            res.status(200).json({
                message: 'Turno cerrado exitosamente',
                shift: shift.toJSON()
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getCurrent = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const employeeId = req.user?.id;
            if (!employeeId) {
                res.status(401).json({ error: 'No autenticado' });
                return;
            }

            const shift = await this.cashShiftService.getCurrentShift(employeeId);
            res.status(200).json({
                shift: shift ? shift.toJSON() : null
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id  = req.params.id as any;
            const shift = await this.cashShiftService.getShiftById(id);
            
            if (!shift) {
                res.status(404).json({ error: 'Turno no encontrado' });
                return;
            }

            res.status(200).json({
                shift: shift.toJSON()
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    getEmployeeShifts = async (req: Request, res: Response): Promise<void> => {
        try {
            const employeeId  = req.params.employeeId as any;
            const shifts = await this.cashShiftService.getEmployeeShifts(employeeId);
            res.status(200).json({
                shifts: shifts.map(s => s.toJSON())
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };
}