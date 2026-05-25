import { beforeEach, describe, expect, test } from "@jest/globals";
import { calculateItemTax, calculateTax } from "../../utils/tax.util";

// Crear el archivo src/utils/tax.util.ts si no existe
describe("Tax Utils", () => {
	describe("calculateItemTax", () => {
		test("debería calcular 19% para código A", () => {
			const tax = calculateItemTax(10000, "A");
			expect(tax).toBe(1900);
		});

		test("debería calcular 5% para código B", () => {
			const tax = calculateItemTax(10000, "B");
			expect(tax).toBe(500);
		});

		test("debería retornar 0 para código C (exento)", () => {
			const tax = calculateItemTax(10000, "C");
			expect(tax).toBe(0);
		});

		test("debería calcular 4% para código D (consumo)", () => {
			const tax = calculateItemTax(10000, "D");
			expect(tax).toBe(400);
		});

		test("debería retornar 0 para código desconocido", () => {
			const tax = calculateItemTax(10000, "X");
			expect(tax).toBe(0);
		});
	});

	describe("calculateTax", () => {
		test("debería sumar impuestos de múltiples items", () => {
			const items = [
				{ subtotal: 10000, taxCode: "A" },
				{ subtotal: 5000, taxCode: "C" },
				{ subtotal: 20000, taxCode: "D" },
			];
			const totalTax = calculateTax(items);
			// 10000*0.19 = 1900 + 0 + 20000*0.04 = 800 => 2700
			expect(totalTax).toBe(2700);
		});

		test("debería retornar 0 para array vacío", () => {
			const totalTax = calculateTax([]);
			expect(totalTax).toBe(0);
		});
	});
});
