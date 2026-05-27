import { validate as isUUID } from "uuid";
import { Products } from "../models/Products.model";
import { CategoryRepository } from "../repositories/Category.repository";
import { ProductsRepository } from "../repositories/Products.repository";

export class ProductService {
	private productRepository: ProductsRepository;
	private categoryRepository: CategoryRepository;

	constructor() {
		this.productRepository = ProductsRepository.getInstance();
		this.categoryRepository = CategoryRepository.getInstance();
	}

	async createProduct(
		barcode: string,
		name: string,
		salePrice: number,
		purchasePrice: number,
		createdBy: string,
		categoryId?: string,
		description?: string,
		offerPrice?: number,
		stock?: number,
		minStock?: number,
		location?: string,
		taxCode?: string,
		unit?: string,
	): Promise<Products> {
		// Validaciones
		if (!barcode || barcode.trim() === "") {
			throw new Error("El código de barras es requerido");
		}
		if (!name || name.length < 2) {
			throw new Error("El nombre debe tener al menos 2 caracteres");
		}
		if (salePrice <= 0) {
			throw new Error("El precio de venta debe ser mayor a 0");
		}
		if (purchasePrice <= 0) {
			throw new Error("El precio de compra debe ser mayor a 0");
		}

		// Verificar que el código de barras no exista
		const existingBarcode = await this.productRepository.findByBarcode(barcode);
		if (existingBarcode) {
			throw new Error(
				`Ya existe un producto con el código de barras ${barcode}`,
			);
		}

		// Verificar categoría si se proporcionó
		if (categoryId) {
			if (!isUUID(categoryId)) {
				throw new Error("ID de categoría inválido");
			}
			const category = await this.categoryRepository.findById(categoryId);
			if (!category) {
				throw new Error("La categoría no existe");
			}
		}

		const product = new Products();
		product.barcode = barcode;
		product.name = name;
		product.description = description || "";
		product.categoryId = categoryId || "";
		product.purchasePrice = purchasePrice;
		product.salePrice = salePrice;
		product.offerPrice = offerPrice || null;
		product.stock = stock || 0;
		product.minStock = minStock || 5;
		product.location = location || "";
		product.taxCode = taxCode || "A";
		product.unit = unit || "unit";
		product.isActive = true;
		

		return await this.productRepository.save(product);
	}

	async getAllProducts(
		page: number = 1,
		limit: number = 50,
	): Promise<{ products: any[]; total: number }> {
		const { products, total } = await this.productRepository.findAll(
			page,
			limit,
		);
		return {
			products: products.map((p) => p.toJSON()),
			total,
		};
	}

	async getProductById(id: string): Promise<Products> {
		if (!isUUID(id)) {
			throw new Error("ID de producto inválido");
		}
		const product = await this.productRepository.findById(id);
		if (!product) {
			throw new Error("Producto no encontrado");
		}
		return product;
	}

	async getProductByBarcode(barcode: string): Promise<Products> {
		const product = await this.productRepository.findByBarcode(barcode);
		if (!product) {
			throw new Error("Producto no encontrado");
		}
		return product;
	}

	async searchProducts(query: string): Promise<Products[]> {
		if (!query || query.trim() === "") {
			return [];
		}
		return await this.productRepository.searchByName(query);
	}

	async getLowStockProducts(): Promise<Products[]> {
		return await this.productRepository.findLowStock();
	}

	async getOutOfStockProducts(): Promise<Products[]> {
		return await this.productRepository.findOutOfStock();
	}

	async updateProduct(
		id: string,
		data: {
			name?: string;
			description?: string;
			categoryId?: string;
			purchasePrice?: number;
			salePrice?: number;
			offerPrice?: number;
			minStock?: number;
			location?: string;
			taxCode?: string;
			isActive?: boolean;
		},
	): Promise<Products> {
		const product = await this.getProductById(id);

		// Validaciones de precio
		if (data.salePrice !== undefined && data.salePrice <= 0) {
			throw new Error("El precio de venta debe ser mayor a 0");
		}
		if (data.purchasePrice !== undefined && data.purchasePrice <= 0) {
			throw new Error("El precio de compra debe ser mayor a 0");
		}

		// Verificar categoría si se cambia
		if (data.categoryId) {
			if (!isUUID(data.categoryId)) {
				throw new Error("ID de categoría inválido");
			}
			const category = await this.categoryRepository.findById(data.categoryId);
			if (!category) {
				throw new Error("La categoría no existe");
			}
		}

		const updated = await this.productRepository.update(id, data);
		if (!updated) {
			throw new Error("Error al actualizar el producto");
		}
		return updated;
	}

	async adjustStock(id: string, newStock: number): Promise<Products> {
		if (newStock < 0) {
			throw new Error("El stock no puede ser negativo");
		}
		const product = await this.productRepository.adjustStock(id, newStock);
		if (!product) {
			throw new Error("Producto no encontrado");
		}
		return product;
	}

	async deleteProduct(id: string): Promise<void> {
		const product = await this.getProductById(id);

		// Verificar si tiene ventas asociadas (cuando implementemos ventas)
		// Temporal: permitir eliminación
		await this.productRepository.delete(id);
	}

	async toggleProduct(id: string): Promise<Products> {
		const product = await this.getProductById(id);
		const updated = await this.productRepository.update(id, {
			isActive: !product.isActive,
		});
		if (!updated) {
			throw new Error("Error al cambiar el estado del producto");
		}
		return updated;
	}
}
