import { Between } from "typeorm";
import { appDataSource } from "../config/database.config";
import { CashShift } from "../models/CashShift.model";
import { Products } from "../models/Products.model";
import { Sale } from "../models/Sale.model";

export class DashboardService {
	async getTodaySales(): Promise<{
		total: number;
		count: number;
		average: number;
	}> {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const sales = await appDataSource.getRepository(Sale).find({
			where: {
				saleDate: Between(today, tomorrow),
				status: "completed",
			},
		});
		const total = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
		const count = sales.length;
		const average = count > 0 ? total / count : 0;

		return { total, count, average };
	}
	//VENTAS DEL MES
	async getMonthSales(): Promise<{
		total: number;
		count: number;
		average: number;
		comparison: number;
	}> {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
		endOfMonth.setHours(23, 59, 59, 999);

		const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
		endOfLastMonth.setHours(23, 59, 59, 999);

		const sales = await appDataSource.getRepository(Sale).find({
			where: {
				saleDate: Between(startOfMonth, endOfMonth),
				status: "completed",
			},
		});

		const lastMonthSales = await appDataSource.getRepository(Sale).find({
			where: {
				saleDate: Between(startOfLastMonth, endOfLastMonth),
				status: "completed",
			},
		});

		const total = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
		const count = sales.length;
		const average = count > 0 ? total / count : 0;
		const lastMonthTotal = lastMonthSales.reduce(
			(sum, sale) => sum + Number(sale.total),
			0,
		);

		let comparison = 0;
		if (lastMonthTotal > 0) {
			comparison = ((total - lastMonthTotal) / lastMonthTotal) * 100;
		}

		return { total, count, average, comparison };
	}

	//PRODUCTOS CON STOCK BAJO

	async getLowStockCount(): Promise<{
		count: number;
		products: { name: string; stock: number; minStock: number }[];
	}> {
		const products = await appDataSource.getRepository(Products).find({
			where: { isActive: true },
		});

		const lowStockProducts = products.filter(
			(p) => p.stock <= p.minStock && p.stock > 0,
		);
		const outOfStockProducts = products.filter((p) => p.stock === 0);

		const allLowStock = [...lowStockProducts, ...outOfStockProducts];
		allLowStock.sort((a, b) => a.stock - b.stock);

		return {
			count: allLowStock.length,
			products: allLowStock.slice(0, 10).map((p) => ({
				name: p.name,
				stock: p.stock,
				minStock: p.minStock,
			})),
		};
	}

	//TURNOS ACTIVOS

	async getActiveShifts(): Promise<{
		count: number;
		shifts: { employeeName: string; openedAt: Date; salesCount?: number }[];
	}> {
		const shifts = await appDataSource.getRepository(CashShift).find({
			where: { status: "open" },
			relations: ["employee"],
		});

		const activeShifts = [];
		for (const shift of shifts) {
			// Contar ventas del turno actual
			const salesCount = await appDataSource.getRepository(Sale).count({
				where: { cashShiftId: shift.id, status: "completed" },
			});

			activeShifts.push({
				employeeName: shift.employee?.fullName || "Desconocido",
				openedAt: shift.openingTime,
				salesCount,
			});
		}

		return {
			count: activeShifts.length,
			shifts: activeShifts,
		};
	}

	//VENTAS POR HORA (ÚLTIMAS 24h)

	async getSalesByHour(): Promise<{
		hours: string[];
		totals: number[];
		transactions: number[];
	}> {
		const now = new Date();
		const twentyFourHoursAgo = new Date(now);
		twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

		const sales = await appDataSource.getRepository(Sale).find({
			where: {
				saleDate: Between(twentyFourHoursAgo, now),
				status: "completed",
			},
		});

		// Inicializar arrays para 24 horas
		const hours: string[] = [];
		const totals: number[] = new Array(24).fill(0);
		const transactions: number[] = new Array(24).fill(0);

		for (let i = 0; i < 24; i++) {
			const hour = (twentyFourHoursAgo.getHours() + i) % 24;
			hours.push(`${hour.toString().padStart(2, "0")}:00`);
		}

		for (const sale of sales) {
			const hour = sale.saleDate.getHours();
			const index = (hour - twentyFourHoursAgo.getHours() + 24) % 24;
			totals[index] += Number(sale.total);
			transactions[index] += 1;
		}

		return { hours, totals, transactions };
	}

	//WIDGET 6: MÉTODOS DE PAGO

	async getPaymentMethods(): Promise<
		{ method: string; count: number; total: number; percentage: number }[]
	> {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const sales = await appDataSource.getRepository(Sale).find({
			where: {
				saleDate: Between(today, tomorrow),
				status: "completed",
			},
		});

		const methodsMap = new Map<string, { count: number; total: number }>();

		for (const sale of sales) {
			const method = sale.paymentMethod;
			const existing = methodsMap.get(method);
			if (existing) {
				existing.count++;
				existing.total += Number(sale.total);
			} else {
				methodsMap.set(method, { count: 1, total: Number(sale.total) });
			}
		}

		const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
		const result = Array.from(methodsMap.entries()).map(([method, data]) => ({
			method: this.getMethodName(method),
			count: data.count,
			total: Number(data.total),
			percentage: totalSales > 0 ? (Number(data.total) / totalSales) * 100 : 0,
		}));

		result.sort((a, b) => b.total - a.total);
		return result;
	}

	private getMethodName(method: string): string {
		const methods: { [key: string]: string } = {
			cash: "Efectivo",
			card: "Tarjeta",
			transfer: "Transferencia",
			mixed: "Mixto",
		};
		return methods[method] || method;
	}
	//WIDGET 7: PRODUCTOS MÁS VENDIDOS HOY

	async getTopProductsToday(
		limit: number = 5,
	): Promise<{ name: string; quantity: number; total: number }[]> {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const sales = await appDataSource.getRepository(Sale).find({
			where: {
				saleDate: Between(today, tomorrow),
				status: "completed",
			},
			relations: ["items", "items.product"],
		});

		const productStats = new Map<
			string,
			{ name: string; quantity: number; total: number }
		>();

		for (const sale of sales) {
			for (const item of sale.items) {
				const existing = productStats.get(item.productId);
				if (existing) {
					existing.quantity += Number(item.quantity);
					existing.total += Number(item.subtotal);
				} else {
					productStats.set(item.productId, {
						name: item.product?.name || "Producto",
						quantity: Number(item.quantity),
						total: Number(item.subtotal),
					});
				}
			}
		}

		return Array.from(productStats.values())
			.sort((a, b) => b.quantity - a.quantity)
			.slice(0, limit);
	}
}
