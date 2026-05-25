import * as fs from "fs";
import * as path from "path";
import PDFDocument from "pdfkit";
import { SaleRepository } from "../repositories/Sale.repository";
import { ConfigService } from "./Config.service";

export class InvoiceService {
	private saleRepository: SaleRepository;
	private configService: ConfigService;
	private readonly WIDTH = 48;

	constructor() {
		this.saleRepository = SaleRepository.getInstance();
		this.configService = new ConfigService();
	}

	private async getBusinessData(): Promise<{
		name: string;
		nit: string;
		address: string;
		phone: string;
	}> {
		const name =
			(await this.configService.getValue("business_name", "Mi Supermercado")) ??
			"Mi Supermercado";
		const nit =
			(await this.configService.getValue("business_nit", "900.123.456-7")) ??
			"900.123.456-7";
		const address =
			(await this.configService.getValue("business_address", "")) ?? "";
		const phone =
			(await this.configService.getValue("business_phone", "")) ?? "";
		return { name, nit, address, phone };
	}

	private line(char = "-"): string {
		return char.repeat(this.WIDTH) + "\n";
	}

	private center(text: string): string {
		const pad = Math.max(0, Math.floor((this.WIDTH - text.length) / 2));
		return " ".repeat(pad) + text + "\n";
	}

	private row(left: string, right: string): string {
		const space = this.WIDTH - left.length - right.length;
		return left + " ".repeat(Math.max(1, space)) + right + "\n";
	}

	private formatPrice(price: number, width: number = 8): string {
		return `$${Math.round(price).toLocaleString("es-CO")}`.padStart(width);
	}
	private formatProductName(name: string, maxLen = 20): string {
		if (name.length > maxLen) return name.substring(0, maxLen - 3) + "...";
		return name.padEnd(maxLen);
	}

	private getTaxLabel(taxCode: string): string {
		switch (taxCode) {
			case "A":
				return "A = 19%";
			case "B":
				return "B =  5%";
			case "D":
				return "D =  4%";
			default:
				return "S = EXE";
		}
	}

	async generateTicket(saleId: string): Promise<string> {
		const sale = await this.saleRepository.findById(saleId);
		if (!sale) throw new Error("Venta no encontrada");

		const business = await this.getBusinessData();
		const date = new Date(sale.saleDate);
		const formattedDate = date.toLocaleString("es-CO");

		let ticket = "";

		// Encabezado
		ticket += this.line("=");
		ticket += this.center(business.name);
		ticket += this.center(`NIT: ${business.nit}`);
		if (business.address) ticket += this.center(business.address);
		if (business.phone) ticket += this.center(`Tel: ${business.phone}`);
		ticket += this.line("=");

		// Datos de la venta
		ticket += this.row("CAJERO:", sale.employee?.fullName || "N/A");
		ticket += this.row("TURNO:", `#${sale.cashShiftId.slice(0, 8)}`);
		ticket += this.row("FECHA:", formattedDate);
		ticket += this.row("CLIENTE:", sale.customerName || "Consumidor Final");
		if (sale.customerDocument)
			ticket += this.row("DOCUMENTO:", sale.customerDocument);
		ticket += this.line("=");

		// Cabecera tabla items (estilo D1)
		ticket += `#   CAN  DESCRIPCION          V.UNIT      TOTAL\n`;
		ticket += this.line("-");

		for (let i = 0; i < sale.items.length; i++) {
			const item = sale.items[i];
			const num = (i + 1).toString().padEnd(4);
			const qty = item.quantity.toString().padEnd(5);
			const name = this.formatProductName(item.product?.name || "Producto");
			const unit = this.formatPrice(item.unitPrice, 12);
			const tot = this.formatPrice(item.subtotal, 12);
			ticket += `${num}${qty}${name}${unit}${tot}  ${item.taxCode}\n`;
		}

		ticket += this.line("-");

		// Totales
		ticket += this.row("SUBTOTAL:", this.formatPrice(sale.subtotal));
		if (sale.discount > 0) {
			ticket += this.row("DESCUENTO:", `-${this.formatPrice(sale.discount)}`);
		}
		ticket += this.row("IVA:", this.formatPrice(sale.tax));
		ticket += this.line("-");
		ticket += this.row("TOTAL:", this.formatPrice(sale.total));
		ticket += this.line("-");

		// Pago
		if (sale.paymentMethod === "cash") {
			ticket += this.row("EFECTIVO:", this.formatPrice(sale.cashReceived));
			ticket += this.row("CAMBIO:", this.formatPrice(sale.cashChange));
		} else if (sale.paymentMethod === "card") {
			ticket += this.row("TARJETA:", this.formatPrice(sale.total));
		} else if (sale.paymentMethod === "transfer") {
			ticket += this.row("TRANSFERENCIA:", this.formatPrice(sale.total));
		}

		// Resumen de impuestos (estilo D1)
		ticket += this.line("-");
		ticket += this.center("RESUMEN DE IMPUESTOS");
		ticket += `${"ID".padEnd(10)}${"BASE".padStart(16)}${"IVA".padStart(14)}${"TOTAL".padStart(14)}\n`;
		ticket += this.line("-");

		// Agrupar items por taxCode
		const taxGroups = new Map<
			string,
			{ base: number; tax: number; total: number }
		>();
		for (const item of sale.items) {
			const code = item.taxCode;
			const existing = taxGroups.get(code) || { base: 0, tax: 0, total: 0 };
			existing.base += Number(item.subtotal);
			existing.tax += Number(item.taxAmount);
			existing.total += Number(item.subtotal) + Number(item.taxAmount);
			taxGroups.set(code, existing);
		}

		for (const [code, values] of taxGroups) {
			const label = this.getTaxLabel(code).padEnd(10);
			const base = this.formatPrice(values.base).padStart(16);
			const tax = this.formatPrice(values.tax).padStart(14);
			const total = this.formatPrice(values.total).padStart(14);
			ticket += `${label}${base}${tax}${total}\n`;
		}

		ticket += this.line("=");
		ticket += this.center("¡GRACIAS POR SU COMPRA!");
		ticket += this.line("=");

		return ticket;
	}

	async generatePDF(saleId: string): Promise<string> {
		const sale = await this.saleRepository.findById(saleId);
		if (!sale) throw new Error("Venta no encontrada");

		const business = await this.getBusinessData();
		const doc = new PDFDocument({ margin: 50, size: "A4" });
		const filename = `factura_${sale.saleNumber}.pdf`;
		const filepath = path.join(__dirname, "../../invoices", filename);

		if (!fs.existsSync(path.join(__dirname, "../../invoices"))) {
			fs.mkdirSync(path.join(__dirname, "../../invoices"), { recursive: true });
		}

		const stream = fs.createWriteStream(filepath);
		doc.pipe(stream);

		// Encabezado
		doc
			.fontSize(16)
			.font("Helvetica-Bold")
			.text(business.name, { align: "center" });
		doc
			.fontSize(10)
			.font("Helvetica")
			.text(`NIT: ${business.nit}`, { align: "center" });
		if (business.address) doc.text(business.address, { align: "center" });
		if (business.phone) doc.text(`Tel: ${business.phone}`, { align: "center" });
		doc.moveDown();

		doc
			.fontSize(10)
			.font("Helvetica-Bold")
			.text("FACTURA ELECTRÓNICA DE VENTA", { align: "center" });
		doc.moveDown();

		const date = new Date(sale.saleDate);
		doc.font("Helvetica").text(`Número: ${sale.saleNumber}`);
		doc.text(`Fecha: ${date.toLocaleString("es-CO")}`);
		doc.text(`Cajero: ${sale.employee?.fullName || "N/A"}`);
		doc.text(`Cliente: ${sale.customerName || "Consumidor Final"}`);
		if (sale.customerDocument) doc.text(`Documento: ${sale.customerDocument}`);
		doc.moveDown();

		// Tabla productos
		const startX = 50;
		let currentY = doc.y;

		doc.font("Helvetica-Bold");
		doc.text("#", startX, currentY);
		doc.text("Cant", startX + 30, currentY);
		doc.text("Descripción", startX + 70, currentY);
		doc.text("V.Unit", startX + 320, currentY);
		doc.text("Total", startX + 410, currentY);
		doc.text("ID", startX + 480, currentY);

		currentY += 5;
		doc
			.moveTo(startX, currentY)
			.lineTo(startX + 500, currentY)
			.stroke();
		currentY += 15;

		doc.font("Helvetica");
		for (let i = 0; i < sale.items.length; i++) {
			const item = sale.items[i];
			const productName = item.product?.name || "Producto";
			doc.text((i + 1).toString(), startX, currentY);
			doc.text(item.quantity.toString(), startX + 30, currentY);
			doc.text(
				productName.length > 35
					? productName.substring(0, 32) + "..."
					: productName,
				startX + 70,
				currentY,
			);
			doc.text(this.formatPrice(item.unitPrice), startX + 320, currentY);
			doc.text(this.formatPrice(item.subtotal), startX + 410, currentY);
			doc.text(item.taxCode, startX + 480, currentY);
			currentY += 20;

			if (currentY > 700) {
				doc.addPage();
				currentY = 50;
			}
		}

		currentY += 5;
		doc
			.moveTo(startX, currentY)
			.lineTo(startX + 500, currentY)
			.stroke();
		currentY += 15;

		// Totales
		doc.font("Helvetica");
		doc.text("Subtotal:", startX + 320, currentY);
		doc.text(this.formatPrice(sale.subtotal), startX + 420, currentY);
		currentY += 20;

		if (sale.discount > 0) {
			doc.text("Descuento:", startX + 320, currentY);
			doc.text(`-${this.formatPrice(sale.discount)}`, startX + 420, currentY);
			currentY += 20;
		}

		doc.text("IVA:", startX + 320, currentY);
		doc.text(this.formatPrice(sale.tax), startX + 420, currentY);
		currentY += 5;

		doc
			.moveTo(startX + 320, currentY)
			.lineTo(startX + 500, currentY)
			.stroke();
		currentY += 10;

		doc.fontSize(12).font("Helvetica-Bold");
		doc.text("TOTAL:", startX + 320, currentY);
		doc.text(this.formatPrice(sale.total), startX + 420, currentY);
		currentY += 30;

		// Pago
		doc.fontSize(10).font("Helvetica");
		if (sale.paymentMethod === "cash") {
			doc.text("Efectivo:", startX, currentY);
			doc.text(this.formatPrice(sale.cashReceived), startX + 150, currentY);
			currentY += 20;
			doc.text("Cambio:", startX, currentY);
			doc.text(this.formatPrice(sale.cashChange), startX + 150, currentY);
		} else if (sale.paymentMethod === "card") {
			doc.text("Tarjeta:", startX, currentY);
			doc.text(this.formatPrice(sale.total), startX + 150, currentY);
		} else if (sale.paymentMethod === "transfer") {
			doc.text("Transferencia:", startX, currentY);
			doc.text(this.formatPrice(sale.total), startX + 150, currentY);
		}
		currentY += 40;

		// Resumen impuestos
		doc.font("Helvetica-Bold").text("RESUMEN DE IMPUESTOS", startX, currentY);
		currentY += 5;
		doc
			.moveTo(startX, currentY)
			.lineTo(startX + 500, currentY)
			.stroke();
		currentY += 15;

		doc.font("Helvetica");
		doc.text("ID", startX, currentY);
		doc.text("BASE", startX + 100, currentY);
		doc.text("IVA", startX + 250, currentY);
		doc.text("TOTAL", startX + 380, currentY);
		currentY += 20;

		const taxGroups = new Map<
			string,
			{ base: number; tax: number; total: number }
		>();
		for (const item of sale.items) {
			const code = item.taxCode;
			const existing = taxGroups.get(code) || { base: 0, tax: 0, total: 0 };
			existing.base += Number(item.subtotal);
			existing.tax += Number(item.taxAmount);
			existing.total += Number(item.subtotal) + Number(item.taxAmount);
			taxGroups.set(code, existing);
		}

		for (const [code, values] of taxGroups) {
			doc.text(this.getTaxLabel(code), startX, currentY);
			doc.text(this.formatPrice(values.base), startX + 100, currentY);
			doc.text(this.formatPrice(values.tax), startX + 250, currentY);
			doc.text(this.formatPrice(values.total), startX + 380, currentY);
			currentY += 20;
		}

		doc.moveDown(3);
		doc
			.fontSize(12)
			.font("Helvetica-Bold")
			.text("¡GRACIAS POR SU COMPRA!", { align: "center" });

		doc.end();

		return new Promise((resolve, reject) => {
			stream.on("finish", () => resolve(filepath));
			stream.on("error", reject);
		});
	}
}
