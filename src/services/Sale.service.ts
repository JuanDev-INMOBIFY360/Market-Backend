// src/services/Sale.service.ts
import { SaleRepository } from '../repositories/Sale.repository';
import { ProductsRepository } from '../repositories/Products.repository';
import { CashShiftRepository } from '../repositories/CashShift.repository';
import { CashMovementRepository } from '../repositories/CashMovement.repository';
import { Cart, CartItem } from '../models/Cart.model';
import { Sale } from '../models/Sale.model';
import { SaleItem } from '../models/SaleItem.model';
import { CashMovement } from '../models/CashMovement.model';
import { appDataSource } from '../config/database.config';
import { Customer } from '../models/Customer.model';
import { InventoryService } from './Inventory.service';

export class SaleService {
    private saleRepository: SaleRepository;
    private productRepository: ProductsRepository;
    private cashShiftRepository: CashShiftRepository;
    private cashMovementRepository: CashMovementRepository;
    private inventoryService: InventoryService;

    private carts: Map<string, Cart> = new Map();

    constructor() {
        this.saleRepository = SaleRepository.getInstance();
        this.productRepository = ProductsRepository.getInstance();
        this.cashShiftRepository = CashShiftRepository.getInstance();
        this.cashMovementRepository = CashMovementRepository.getInstance();
        this.inventoryService = new InventoryService();
    }

    private getCart(shiftId: string): Cart {
        if (!this.carts.has(shiftId)) {
            this.carts.set(shiftId, new Cart());
        }
        return this.carts.get(shiftId)!;
    }

    async addToCart(shiftId: string, productId: string, quantity: number): Promise<CartItem[]> {
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        if (!product.isActive) {
            throw new Error('Producto inactivo');
        }

        if (product.stock < quantity) {
            throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
        }

        const cart = this.getCart(shiftId);
        const item: CartItem = {
            productId: product.id,
            productName: product.name,
            productBarcode: product.barcode,
            quantity,
            unitPrice: product.salePrice,
            subtotal: quantity * product.salePrice,
            taxCode: product.taxCode
        };

        cart.addItem(item);
        return cart.getItems();
    }

    async removeFromCart(shiftId: string, index: number): Promise<CartItem[]> {
        const cart = this.getCart(shiftId);
        cart.removeItem(index);
        return cart.getItems();
    }

    async updateCartItem(shiftId: string, index: number, quantity: number): Promise<CartItem[]> {
        const cart = this.getCart(shiftId);
        cart.updateQuantity(index, quantity);
        return cart.getItems();
    }

    async getCartItems(shiftId: string): Promise<{ items: CartItem[]; subtotal: number; total: number }> {
        const cart = this.getCart(shiftId);
        return {
            items: cart.getItems(),
            subtotal: cart.getSubtotal(),
            total: cart.getTotal()
        };
    }

    async clearCart(shiftId: string): Promise<void> {
        const cart = this.getCart(shiftId);
        cart.clear();
    }

    async createSale(
        shiftId: string,
        employeeId: string,
        paymentMethod: string,
        cashReceived?: number,
        customerId?: string,
        customerName?: string,
        customerDocument?: string
    ): Promise<Sale> {
        const cart = this.getCart(shiftId);
        const items = cart.getItems();

        if (items.length === 0) {
            throw new Error('El carrito está vacío');
        }

        // Verificar stock nuevamente
        for (const item of items) {
            const product = await this.productRepository.findById(item.productId);
            if (!product || product.stock < item.quantity) {
                throw new Error(`Stock insuficiente para ${item.productName}`);
            }
        }

        const subtotal = cart.getSubtotal();
        const tax = this.calculateTax(items);
        const total = subtotal + tax;

        let cashChange = 0;
        if (paymentMethod === 'cash') {
            if (!cashReceived || cashReceived < total) {
                throw new Error('Efectivo insuficiente');
            }
            cashChange = cashReceived - total;
        }

        const saleNumber = await this.saleRepository.findNextSaleNumber();

        const sale = new Sale();
        sale.saleNumber = saleNumber;
        sale.cashShiftId = shiftId;
        sale.employeeId = employeeId;
        sale.customerId = customerId || '';
        sale.customerName = customerName || 'Consumidor Final';
        sale.customerDocument = customerDocument || '';
        sale.subtotal = subtotal;
        sale.discount = 0;
        sale.subtotalWithDiscount = subtotal;
        sale.tax = tax;
        sale.total = total;
        sale.pointsEarned = 0;
        sale.pointsUsed = 0;
        sale.paymentMethod = paymentMethod as any;
        sale.cashReceived = cashReceived || 0;
        sale.cashChange = cashChange;
        sale.status = 'completed';

        // Crear items (pero sin guardar aún)
        const saleItems: SaleItem[] = [];
        for (const item of items) {
            const product = await this.productRepository.findById(item.productId);
            const taxAmount = this.calculateItemTax(item.subtotal, product!.taxCode);

            const saleItem = new SaleItem();
            saleItem.productId = item.productId;
            saleItem.quantity = item.quantity;
            saleItem.unitPrice = item.unitPrice;
            saleItem.discount = 0;
            saleItem.subtotal = item.subtotal;
            saleItem.taxCode = product!.taxCode;
            saleItem.taxAmount = taxAmount;
            saleItems.push(saleItem);

            // Disminuir stock
            await this.productRepository.adjustStock(item.productId, product!.stock - item.quantity);
        }

        sale.items = saleItems;

        // Guardar venta (esto genera el ID)
        const savedSale = await this.saleRepository.save(sale);

        // 🔥 REGISTRAR MOVIMIENTOS DE INVENTARIO (solo después de tener el ID)
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            await this.inventoryService.registerMovement(
                item.productId,
                'sale',
                item.quantity,
                employeeId,
                savedSale.id,  // ← Ahora sí existe
                `Venta #${savedSale.saleNumber}`
            );
        }

        // Puntos del cliente
        if (customerId && customerId !== '') {
            try {
                const pointsEarned = Math.floor(total * 0.01);
                if (pointsEarned > 0) {
                    savedSale.pointsEarned = pointsEarned;
                    await this.saleRepository.update(savedSale.id, { pointsEarned });

                    const customer = await appDataSource.getRepository(Customer).findOneBy({ id: customerId });
                    if (customer) {
                        customer.points += pointsEarned;
                        customer.totalSpent = (customer.totalSpent || 0) + total;
                        await appDataSource.getRepository(Customer).save(customer);
                    }
                }
            } catch (error) {
                console.error('Error al sumar puntos:', error);
            }
        }

        // Registrar movimiento de caja (si es efectivo)
        if (paymentMethod === 'cash') {
            const movement = new CashMovement();
            movement.cashShiftId = shiftId;
            movement.employeeId = employeeId;
            movement.type = 'sale';
            movement.amount = total;
            movement.paymentMethod = 'cash';
            movement.referenceId = savedSale.id;
            movement.description = `Venta #${saleNumber}`;
            await this.cashMovementRepository.save(movement);
        }

        // Limpiar carrito
        cart.clear();

        return savedSale;
    }

    private calculateTax(items: CartItem[]): number {
        let tax = 0;
        for (const item of items) {
            tax += this.calculateItemTax(item.subtotal, item.taxCode);
        }
        return tax;
    }

    private calculateItemTax(subtotal: number, taxCode: string): number {
        switch (taxCode) {
            case 'A':
                return subtotal * 0.19; // 19% IVA
            case 'B':
                return subtotal * 0.05; // 5% IVA
            case 'D':
                return subtotal * 0.04; // 4% consumo
            default:
                return 0; // C = exento
        }
    }

    async getAllSales(): Promise<Sale[]> {
        return await this.saleRepository.findAll();
    }

    async getSaleById(id: string): Promise<Sale> {
        const sale = await this.saleRepository.findById(id);
        if (!sale) {
            throw new Error('Venta no encontrada');
        }
        return sale;
    }

    async cancelSale(id: string, cancelledBy: string, reason: string): Promise<Sale> {
        const sale = await this.getSaleById(id);
        if (sale.status === 'cancelled') {
            throw new Error('La venta ya está cancelada');
        }

        // Revertir stock
        for (const item of sale.items) {
            const product = await this.productRepository.findById(item.productId);
            if (product) {
                await this.productRepository.adjustStock(item.productId, product.stock + item.quantity);
                await this.inventoryService.registerMovement(
                    item.productId,
                    'return_sale',
                    item.quantity,
                    cancelledBy,
                    sale.id,
                    `Cancelación venta #${sale.saleNumber} - Motivo: ${reason}`
                );
            }
        }

        sale.status = 'cancelled';
        sale.cancelledBy = cancelledBy;
        sale.cancelledReason = reason;
        sale.cancelledAt = new Date();

        return await this.saleRepository.save(sale);
    }
}