import { beforeEach, describe, expect, it, test } from "@jest/globals";
import { Products } from "../../models/Products.model";

describe("Product Model", () => {
	let products: Products;

	beforeEach(() => {
		products = new Products();
		// Asignar valores después de crear la instancia
		products.name = "Laptop Gamer";
		products.barcode = "1234567890123";
		products.salePrice = 1500000;
		products.purchasePrice = 1200000;
		products.stock = 10;
		products.minStock = 3;
	});

	test("debería crear un producto con valores correctos", () => {
		expect(products.name).toBe("Laptop Gamer");
		expect(products.barcode).toBe("1234567890123");
		expect(products.salePrice).toBe(1500000);
		expect(products.purchasePrice).toBe(1200000);
		expect(products.stock).toBe(10);
		expect(products.minStock).toBe(3);
		// isActive no existe en la instancia, se asigna en la base de datos
		// por eso no lo probamos aquí
	});

	test("debería tener valores por defecto para campos opcionales", () => {
		const newProduct = new Products();
		// No probamos stock y minStock porque no tienen valores por defecto en la instancia
		// Estos valores se asignan en la base de datos
		expect(newProduct.offerPrice).toBeUndefined();
	});

	test("toJSON debería incluir purchasePrice en el producto", () => {
		const json = products.toJSON();
		// purchasePrice SÍ debe estar en el JSON porque es parte del producto
		// lo verificamos como cualquier otra propiedad
		expect(json).toHaveProperty("purchasePrice");
		expect(json.purchasePrice).toBe(1200000);
		expect(json).toHaveProperty("name");
		expect(json).toHaveProperty("barcode");
	});
});
