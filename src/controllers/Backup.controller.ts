import { Request, Response } from 'express';
import { BackupService } from '../services/Backup.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class BackupController {
    private backupService: BackupService;

    constructor() {
        this.backupService = new BackupService();
    }

    // POST /backup/create
    createBackup = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const backup = await this.backupService.createBackup();
            res.status(201).json({
                message: 'Backup creado exitosamente',
                backup
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    // POST /backup/create-full
    createFullBackup = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const backup = await this.backupService.createFullBackup();
            res.status(201).json({
                message: 'Backup completo creado exitosamente',
                backup
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    // GET /backup/list
    listBackups = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const backups = await this.backupService.listBackups();
            res.status(200).json({ backups });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    // POST /backup/restore/:filename
    restoreBackup = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const  filename  = req.params.filename as string;
            await this.backupService.restoreBackup(filename);
            res.status(200).json({ message: 'Backup restaurado exitosamente' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    // DELETE /backup/:filename
    deleteBackup = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const  filename  = req.params.filename as string;
            await this.backupService.deleteBackup(filename);
            res.status(200).json({ message: 'Backup eliminado exitosamente' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };
}