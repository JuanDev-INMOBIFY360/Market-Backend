import { Request, Response } from 'express';
import { InvoiceService } from '../services/Invoice.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as fs from 'fs';

export class InvoiceController {
    private invoiceService: InvoiceService;

    constructor() {
        this.invoiceService = new InvoiceService();
    }

    getTicket = async (req: Request, res: Response): Promise<void> => {
        try {
            const  saleId  = req.params.id as string;
            const ticket = await this.invoiceService.generateTicket(saleId);
            
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `inline; filename=ticket_${saleId}.txt`);
            res.send(ticket);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    getPDF = async (req: Request, res: Response): Promise<void> => {
        try {
            const  saleId = req.params.id as string;
            const filepath = await this.invoiceService.generatePDF(saleId);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=factura_${saleId}.pdf`);
            
            const stream = fs.createReadStream(filepath);
            stream.pipe(res);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    print = async (req: Request, res: Response): Promise<void> => {
        try {
            const  saleId  = req.params.id as string;
            const ticket = await this.invoiceService.generateTicket(saleId);
            
            // En desarrollo, solo mostramos el ticket
            // En producción, aquí iría la impresión a la impresora térmica
            console.log('=== TICKET A IMPRIMIR ===');
            console.log(ticket);
            console.log('========================');
            
            res.status(200).json({
                message: 'Ticket enviado a impresión (simulado)',
                ticket
            });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };
}