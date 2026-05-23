// src/services/Report.service.ts
import { appDataSource } from '../config/database.config';
import { Sale } from '../models/Sale.model';
import { SaleItem } from '../models/SaleItem.model';
import { Products } from '../models/Products.model';
import { Employee } from '../models/Employee.model';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

export class ReportService {

    // ============ REPORTE 1: VENTAS DEL DÍA ============
    async getDailySales(): Promise<any> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const sales = await appDataSource.getRepository(Sale).find({
            where: {
                saleDate: Between(today, tomorrow),
                status: 'completed'
            },
            relations: ['items', 'items.product', 'employee']
        });

        const total = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
        const transactions = sales.length;
        const averageTicket = transactions > 0 ? total / transactions : 0;

        // Productos más vendidos del día
        const productCount: Map<string, { name: string; quantity: number; total: number }> = new Map();

        for (const sale of sales) {
            for (const item of sale.items) {
                const productId = item.productId;
                const existing = productCount.get(productId);
                if (existing) {
                    existing.quantity += Number(item.quantity);
                    existing.total += Number(item.subtotal);
                } else {
                    productCount.set(productId, {
                        name: item.product?.name || 'Producto',
                        quantity: Number(item.quantity),
                        total: Number(item.subtotal)
                    });
                }
            }
        }

        const topProducts = Array.from(productCount.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        return {
            date: today.toISOString().split('T')[0],
            total,
            transactions,
            averageTicket,
            topProducts
        };
    }

    // ============ REPORTE 2: VENTAS POR PERÍODO ============
    async getSalesByPeriod(startDate: Date, endDate: Date): Promise<any> {
        const sales = await appDataSource.getRepository(Sale).find({
            where: {
                saleDate: Between(startDate, endDate),
                status: 'completed'
            },
            relations: ['items', 'items.product', 'employee']
        });

        const total = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
        const transactions = sales.length;

        // Agrupar por día
        const daily: { [key: string]: { total: number; count: number } } = {};
        for (const sale of sales) {
            const dateKey = sale.saleDate.toISOString().split('T')[0];
            if (!daily[dateKey]) {
                daily[dateKey] = { total: 0, count: 0 };
            }
            daily[dateKey].total += sale.total;
            daily[dateKey].count++;
        }

        const dailySummary = Object.entries(daily).map(([date, data]) => ({
            date,
            total: data.total,
            transactions: data.count,
            average: data.total / data.count
        }));

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            total,
            transactions,
            averageTicket: transactions > 0 ? total / transactions : 0,
            dailySummary
        };
    }

    // ============ REPORTE 3: PRODUCTOS MÁS VENDIDOS ============
    async getTopProducts(limit: number = 10, startDate?: Date, endDate?: Date): Promise<any> {
        let whereCondition = {};
        if (startDate && endDate) {
            whereCondition = { saleDate: Between(startDate, endDate) };
        }

        const sales = await appDataSource.getRepository(Sale).find({
            where: { status: 'completed', ...whereCondition },
            relations: ['items', 'items.product']
        });

        const productStats: Map<string, { name: string; quantity: number; total: number }> = new Map();

        for (const sale of sales) {
            for (const item of sale.items) {
                const productId = item.productId;
                const existing = productStats.get(productId);
                if (existing) {
                    existing.quantity += Number(item.quantity);
                    existing.total += Number(item.subtotal);
                } else {
                    productStats.set(productId, {
                        name: item.product?.name || 'Producto',
                        quantity: Number(item.quantity),
                        total: Number(item.subtotal)
                    });
                }
            }
        }

        const byQuantity = Array.from(productStats.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, limit);

        const byValue = Array.from(productStats.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, limit);

        return {
            byQuantity,
            byValue
        };
    }

    // ============ REPORTE 4: PRODUCTOS CON STOCK BAJO ============
    async getLowStockProducts(): Promise<any> {
        const products = await appDataSource.getRepository(Products).find({
            where: { isActive: true },
            order: { stock: 'ASC' }
        });

        const lowStock = products.filter(p => p.stock <= p.minStock);
        const outOfStock = products.filter(p => p.stock === 0);
        const critical = products.filter(p => p.stock > 0 && p.stock <= 3);

        return {
            lowStock: lowStock.map(p => ({ id: p.id, name: p.name, stock: p.stock, minStock: p.minStock })),
            outOfStock: outOfStock.map(p => ({ id: p.id, name: p.name, stock: p.stock })),
            critical: critical.map(p => ({ id: p.id, name: p.name, stock: p.stock }))
        };
    }

    // ============ REPORTE 5: VENTAS POR CAJERO ============
    async getEmployeePerformance(startDate?: Date, endDate?: Date): Promise<any> {
        let whereCondition: any = { status: 'completed' };
        if (startDate && endDate) {
            whereCondition.saleDate = Between(startDate, endDate);
        }

        const sales = await appDataSource.getRepository(Sale).find({
            where: whereCondition,
            relations: ['employee']
        });

        const employeeStats: Map<string, { name: string; total: number; count: number }> = new Map();

        for (const sale of sales) {
            const employeeId = sale.employeeId;
            const existing = employeeStats.get(employeeId);
            if (existing) {
                existing.total += sale.total;
                existing.count++;
            } else {
                employeeStats.set(employeeId, {
                    name: sale.employee?.fullName || 'Desconocido',
                    total: sale.total,
                    count: 1
                });
            }
        }

        const ranking = Array.from(employeeStats.values())
            .sort((a, b) => b.total - a.total)
            .map((e, index) => ({
                rank: index + 1,
                name: e.name,
                total: e.total,
                transactions: e.count,
                average: e.total / e.count
            }));

        const totalSales = ranking.reduce((sum, e) => sum + e.total, 0);
        const totalTransactions = ranking.reduce((sum, e) => sum + e.transactions, 0);

        return {
            period: {
                startDate: startDate?.toISOString().split('T')[0] || 'inicio',
                endDate: endDate?.toISOString().split('T')[0] || 'hoy'
            },
            ranking,
            totals: {
                sales: totalSales,
                transactions: totalTransactions,
                averageTicket: totalTransactions > 0 ? totalSales / totalTransactions : 0
            }
        };

    }

    // ============ REPORTE 6: GANANCIA BRUTA ============
    async getGrossProfit(startDate?: Date, endDate?: Date): Promise<any> {
        let saleWhere: any = { status: 'completed' };
        if (startDate && endDate) {
            saleWhere.saleDate = Between(startDate, endDate);
        }

        const sales = await appDataSource.getRepository(Sale).find({
            where: saleWhere,
            relations: ['items', 'items.product']
        });

        let totalSales = 0;
        let totalCost = 0;

        for (const sale of sales) {
            for (const item of sale.items) {
                totalSales += item.subtotal;
                // Costo aproximado: precio de compra del producto
                const costPrice = item.product?.purchasePrice || 0;
                totalCost += costPrice * item.quantity;
            }
        }

        const grossProfit = totalSales - totalCost;
        const margin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

        return {
            period: {
                startDate: startDate?.toISOString().split('T')[0] || 'inicio',
                endDate: endDate?.toISOString().split('T')[0] || 'hoy'
            },
            totalSales,
            totalCost,
            grossProfit,
            margin: margin.toFixed(2)
        };
    }

    // ============ REPORTE 7: IMPUESTOS A DECLARAR ============
    async getTaxReport(startDate?: Date, endDate?: Date): Promise<any> {
        let saleWhere: any = { status: 'completed' };
        if (startDate && endDate) {
            saleWhere.saleDate = Between(startDate, endDate);
        }

        const sales = await appDataSource.getRepository(Sale).find({
            where: saleWhere,
            relations: ['items']
        });

        const purchaseWhere: any = { status: 'completed' };
        if (startDate && endDate) {
            purchaseWhere.purchaseDate = Between(startDate, endDate);
        }

        const purchases = await appDataSource.getRepository('purchases').find({
            where: purchaseWhere
        });

        const totalTaxCollected = sales.reduce((sum, sale) => sum + (Number(sale.tax) || 0), 0);
        const totalTaxPaid = purchases.reduce((sum: number, purchase: any) => sum + (purchase.tax || 0), 0);
        const taxToPay = totalTaxCollected - totalTaxPaid;

        return {
            period: {
                startDate: startDate?.toISOString().split('T')[0] || 'inicio',
                endDate: endDate?.toISOString().split('T')[0] || 'hoy'
            },
            ivaCollected: totalTaxCollected,
            ivaPaid: totalTaxPaid,
            ivaToPay: taxToPay > 0 ? taxToPay : 0,
            ivaToClaim: taxToPay < 0 ? Math.abs(taxToPay) : 0
        };
    }
}