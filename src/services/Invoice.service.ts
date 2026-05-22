import { SaleRepository } from '../repositories/Sale.repository';
import { ConfigService } from './Config.service';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export class InvoiceService {
    private saleRepository: SaleRepository;
    private configService: ConfigService;

    constructor() {
        this.saleRepository = SaleRepository.getInstance();
        this.configService = new ConfigService();
    }

    private async getBusinessData(): Promise<{ name: string; nit: string; address: string; phone: string }> {
    const name = (await this.configService.getValue('business_name', 'Mi Supermercado')) ?? 'Mi Supermercado';
    const nit = (await this.configService.getValue('business_nit', '900.123.456-7')) ?? '900.123.456-7';
    const address = (await this.configService.getValue('business_address', '')) ?? '';
    const phone = (await this.configService.getValue('business_phone', '')) ?? '';
    
    return { name, nit, address, phone };
}

    async generateTicket(saleId: string): Promise<string> {
        const sale = await this.saleRepository.findById(saleId);
        if (!sale) {
            throw new Error('Venta no encontrada');
        }

        const business = await this.getBusinessData();

        const date = new Date(sale.saleDate);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

        let ticket = '';
        ticket += '='.repeat(32) + '\n';
        ticket += `     ${business.name}\n`;
        ticket += `        NIT: ${business.nit}\n`;
        if (business.address) ticket += `     ${business.address}\n`;
        if (business.phone) ticket += `        Tel: ${business.phone}\n`;
        ticket += '='.repeat(32) + '\n';
        ticket += `CAJERO: ${sale.employee?.fullName || 'N/A'}     TURNO: #${sale.cashShiftId.slice(0, 8)}\n`;
        ticket += `FECHA: ${formattedDate}\n`;
        ticket += `CLIENTE: ${sale.customerName || 'Consumidor Final'}\n`;
        if (sale.customerDocument) ticket += `DOCUMENTO: ${sale.customerDocument}\n`;
        ticket += '='.repeat(32) + '\n';
        ticket += 'CANT  PRODUCTO          PRECIO   TOTAL\n';
        ticket += '-'.repeat(32) + '\n';

        for (const item of sale.items) {
            const productName = item.product?.name || 'Producto';
            const truncatedName = productName.length > 20 ? productName.substring(0, 17) + '...' : productName.padEnd(20);
            ticket += `${item.quantity.toString().padEnd(5)}${truncatedName}${this.formatPrice(item.unitPrice).padStart(7)}${this.formatPrice(item.subtotal).padStart(8)}\n`;
        }

        ticket += '-'.repeat(32) + '\n';
        ticket += `SUBTOTAL:${this.formatPrice(sale.subtotal).padStart(24)}\n`;
        if (sale.discount > 0) {
            ticket += `DESCUENTO:${this.formatPrice(sale.discount).padStart(23)}\n`;
        }
        ticket += `IVA (19%):${this.formatPrice(sale.tax).padStart(23)}\n`;
        ticket += `TOTAL:${this.formatPrice(sale.total).padStart(27)}\n`;
        ticket += '-'.repeat(32) + '\n';

        if (sale.paymentMethod === 'cash') {
            ticket += `EFECTIVO:${this.formatPrice(sale.cashReceived).padStart(24)}\n`;
            ticket += `VUELTO:${this.formatPrice(sale.cashChange).padStart(26)}\n`;
        } else if (sale.paymentMethod === 'card') {
            ticket += `TARJETA:${this.formatPrice(sale.total).padStart(25)}\n`;
            if (sale.cardReceipt) ticket += `RECIBO: ${sale.cardReceipt}\n`;
            if (sale.cardRrn) ticket += `RRN: ${sale.cardRrn}\n`;
            if (sale.cardApproval) ticket += `APROB: ${sale.cardApproval}\n`;
        } else if (sale.paymentMethod === 'transfer') {
            ticket += `TRANSFERENCIA:${this.formatPrice(sale.total).padStart(20)}\n`;
            if (sale.transferReference) ticket += `REF: ${sale.transferReference}\n`;
        }

        ticket += '-'.repeat(32) + '\n';
        ticket += '     ¡GRACIAS POR SU COMPRA!\n';
        ticket += '='.repeat(32) + '\n';

        return ticket;
    }

    async generatePDF(saleId: string): Promise<string> {
        const sale = await this.saleRepository.findById(saleId);
        if (!sale) {
            throw new Error('Venta no encontrada');
        }

        const business = await this.getBusinessData();

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = `factura_${sale.saleNumber}.pdf`;
        const filepath = path.join(__dirname, '../../invoices', filename);

        if (!fs.existsSync(path.join(__dirname, '../../invoices'))) {
            fs.mkdirSync(path.join(__dirname, '../../invoices'), { recursive: true });
        }

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Encabezado
        doc.fontSize(16).font('Helvetica-Bold').text(business.name, { align: 'center' });
        doc.fontSize(10).font('Helvetica').text(`NIT: ${business.nit}`, { align: 'center' });
        if (business.address) doc.text(business.address, { align: 'center' });
        if (business.phone) doc.text(`Tel: ${business.phone}`, { align: 'center' });
        doc.moveDown();

        // Datos de la factura
        doc.fontSize(10).font('Helvetica-Bold').text('FACTURA ELECTRÓNICA DE VENTA', { align: 'center' });
        doc.moveDown();
        
        const date = new Date(sale.saleDate);
        doc.font('Helvetica').text(`Número: ${sale.saleNumber}`);
        doc.text(`Fecha: ${date.toLocaleString('es-CO')}`);
        doc.text(`Cajero: ${sale.employee?.fullName || 'N/A'}`);
        doc.text(`Cliente: ${sale.customerName || 'Consumidor Final'}`);
        if (sale.customerDocument) doc.text(`Documento: ${sale.customerDocument}`);
        doc.moveDown();

        // Tabla de productos
        const startX = 50;
        let currentY = doc.y;
        
        doc.font('Helvetica-Bold');
        doc.text('Cant', startX, currentY);
        doc.text('Producto', startX + 60, currentY);
        doc.text('Precio', startX + 350, currentY);
        doc.text('Total', startX + 450, currentY);
        
        currentY += 20;
        doc.font('Helvetica');
        
        for (const item of sale.items) {
            const productName = item.product?.name || 'Producto';
            doc.text(item.quantity.toString(), startX, currentY);
            doc.text(productName.length > 40 ? productName.substring(0, 37) + '...' : productName, startX + 60, currentY);
            doc.text(this.formatPrice(item.unitPrice), startX + 350, currentY);
            doc.text(this.formatPrice(item.subtotal), startX + 450, currentY);
            currentY += 20;
            
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }
        }

        currentY += 20;
        doc.font('Helvetica-Bold');
        doc.text(`SUBTOTAL: ${this.formatPrice(sale.subtotal)}`, startX + 400, currentY);
        currentY += 20;
        if (sale.discount > 0) {
            doc.text(`DESCUENTO: ${this.formatPrice(sale.discount)}`, startX + 400, currentY);
            currentY += 20;
        }
        doc.text(`IVA: ${this.formatPrice(sale.tax)}`, startX + 400, currentY);
        currentY += 20;
        doc.fontSize(14).text(`TOTAL: ${this.formatPrice(sale.total)}`, startX + 400, currentY);
        currentY += 30;
        
        doc.fontSize(10).font('Helvetica');
        if (sale.paymentMethod === 'cash') {
            doc.text(`Efectivo: ${this.formatPrice(sale.cashReceived)}`, startX, currentY);
            doc.text(`Vuelto: ${this.formatPrice(sale.cashChange)}`, startX + 200, currentY);
        } else if (sale.paymentMethod === 'card') {
            doc.text(`Tarjeta: ${this.formatPrice(sale.total)}`, startX, currentY);
        } else if (sale.paymentMethod === 'transfer') {
            doc.text(`Transferencia: ${this.formatPrice(sale.total)}`, startX, currentY);
        }

        doc.moveDown();
        doc.moveDown();
        doc.fontSize(12).font('Helvetica-Bold').text('¡GRACIAS POR SU COMPRA!', { align: 'center' });

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve(filepath));
            stream.on('error', reject);
        });
    }

    private formatPrice(price: number): string {
        return `$${price.toLocaleString('es-CO')}`;
    }
}