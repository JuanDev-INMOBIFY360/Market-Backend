import { Purchase } from "../models/Purchase.model";
import { PurchaseItem } from "../models/PurchaseItem.model";
import { ProductsRepository } from "../repositories/Products.repository";
import { PurchaseRepository } from "../repositories/Purchase.repository";
import { PurchaseItemRepository } from "../repositories/PurchaseItem.repository";
import { SupplierRepository } from "../repositories/Supplier.repository";
import { InventoryService } from "./Inventory.service";

interface PurchaseItemInput {
	productId: string;
	quantity: number;
	unitPrice: number;
}

export class PurchaseService {
	private purchaseRepository: PurchaseRepository;
	private purchaseItemRepository: PurchaseItemRepository;
	private productsRepository: ProductsRepository;
	private supplierRepository: SupplierRepository;
	private inventoryService: InventoryService;

	constructor() {
		this.purchaseRepository = PurchaseRepository.getInstance();
		this.purchaseItemRepository = PurchaseItemRepository.getInstance();
		this.productsRepository = ProductsRepository.getInstance();
		this.supplierRepository = SupplierRepository.getInstance();
		this.inventoryService = new InventoryService();
	}

	async createPurchase(
		supplierId: string,
		invoiceNumber: string,
		employeeId: string,
		items: PurchaseItemInput[],
		notes?: string,
	): Promise<Purchase> {
		const supplier = await this.supplierRepository.findById(supplierId);
		if (!supplier) throw new Error("Proveedor no encontrado");

		const existingPurchases = await this.purchaseRepository.findAll();
		if (existingPurchases.some((p) => p.invoiceNumber === invoiceNumber)) {
			throw new Error(`Ya existe una compra con la factura ${invoiceNumber}`);
		}

		let subtotal = 0;
		for (const item of items) {
			const product = await this.productsRepository.findById(item.productId);
			if (!product) throw new Error(`Producto ${item.productId} no encontrado`);
			subtotal += item.quantity * item.unitPrice;
		}

		const tax = subtotal * 0.19;
		const total = subtotal + tax;

		const purchase = new Purchase();
		purchase.supplierId = supplierId;
		purchase.invoiceNumber = invoiceNumber;
		purchase.employeeId = employeeId;
		purchase.subtotal = subtotal;
		purchase.tax = tax;
		purchase.total = total;
		purchase.status = "pending";
		purchase.notes = notes || "";
		const savedPurchase = await this.purchaseRepository.save(purchase);

		for (const item of items) {
			const purchaseItem = new PurchaseItem();
			purchaseItem.purchaseId = savedPurchase.id;
			purchaseItem.productId = item.productId;
			purchaseItem.quantity = item.quantity;
			purchaseItem.unitPrice = item.unitPrice;
			purchaseItem.subtotal = item.quantity * item.unitPrice;
			await this.purchaseItemRepository.save(purchaseItem);
		}

		const completedPurchase = await this.purchaseRepository.findById(
			savedPurchase.id,
		);
		console.log("ITEMS EN DB:", JSON.stringify(completedPurchase?.items));
		if (!completedPurchase) throw new Error("Error al guardar la compra");
		return completedPurchase;
	}
	async getAllPurcharses(): Promise<Purchase[]> {
		return await this.purchaseRepository.findAll();
	}

	async getPurcharseById(id: string): Promise<Purchase> {
		const purchase = await this.purchaseRepository.findById(id);
		if (!purchase) {
			throw new Error("compra no encontrada");
		}
		return purchase;
	}

	async updatePurchase(id: string, data: Partial<Purchase>): Promise<Purchase> {
		const purchase = await this.getPurcharseById(id);
		if (!purchase) {
			throw new Error("Compra no encontrada");
		}
		if (purchase.status !== "pending") {
			throw new Error("Solo se pueden editar compras pendientes");
		}
		const updated = await this.purchaseRepository.update(id, data);
		if (!updated) {
			throw new Error("Error al actualizar la compra");
		}
		return updated;
	}

	async confirmPurchase(id: string): Promise<Purchase> {
		const purchase = await this.getPurcharseById(id);
		if (purchase.status !== "pending") {
			throw new Error("La compra no está pendiente");
		}

		for (const item of purchase.items) {
			const product = await this.productsRepository.findById(item.productId);
			if (!product) continue;
			const newStock = product.stock + item.quantity;
			await this.productsRepository.adjustStock(item.productId, newStock);

			await this.inventoryService.registerMovement(
				item.productId,
				"purchase",
				item.quantity,
				purchase.employeeId,
				purchase.id,
				`Compra #${purchase.invoiceNumber}`,
			);
		}

		purchase.status = "completed";
		return await this.purchaseRepository.save(purchase);
	}

	async cancelPurchase(id: string): Promise<Purchase> {
		const purchase = await this.getPurcharseById(id);
		if (purchase.status === "cancelled") {
			throw new Error("La compra ya se encuentra cancelada");
		}
		if (purchase.status === "completed") {
			for (const item of purchase.items) {
				const product = await this.productsRepository.findById(item.id);

				if (!product) continue;
				const newStock = product.stock - item.quantity;
				if (newStock < 0) {
					throw new Error(
						`Stock insuficiente para revertir el producto ${product.name}`,
					);
				}
				await this.productsRepository.adjustStock(item.productId, newStock);
				await this.inventoryService.registerMovement(
					item.productId,
					"return_purchase",
					item.quantity,
					purchase.employeeId,
					purchase.id,
					`Cancelación compra #${purchase.invoiceNumber}`,
				);
			}
		}
		purchase.status = "cancelled";
		return await this.purchaseRepository.save(purchase);
	}
}
