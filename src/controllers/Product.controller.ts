import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { ProductService } from "../services/Product.service";

export class ProductController {
	private productService: ProductService;

	constructor() {
		this.productService = new ProductService();
	}

	// POST /products - Crear producto
	create = async (req: AuthRequest, res: Response): Promise<void> => {
		try {
			const userId = req.user?.id;
			if (!userId) {
				res.status(401).json({ error: "No autenticado" });
				return;
			}

			const {
				barcode,
				name,
				salePrice,
				purchasePrice,
				categoryId,
				description,
				offerPrice,
				stock,
				minStock,
				location,
				taxCode,
			} = req.body;

			if (!barcode || !name || !salePrice || !purchasePrice) {
				res.status(400).json({
					error:
						"Faltan campos requeridos: barcode, name, salePrice, purchasePrice",
				});
				return;
			}

			const product = await this.productService.createProduct(
				barcode,
				name,
				salePrice,
				purchasePrice,
				userId,
				categoryId,
				description,
				offerPrice,
				stock,
				minStock,
				location,
				taxCode,
			);

			res.status(201).json({
				message: "Producto creado exitosamente",
				product: product.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	// GET /products - Listar productos
	getAll = async (req: Request, res: Response): Promise<void> => {
		try {
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 50;

			const { products, total } = await this.productService.getAllProducts(
				page,
				limit,
			);

			res.status(200).json({
				products,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit),
				},
			});
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	// GET /products/barcode/:barcode - Buscar por código de barras
	getByBarcode = async (req: Request, res: Response): Promise<void> => {
		try {
			const barcode = req.params.barcode as string;
			const product = await this.productService.getProductByBarcode(barcode);

			res.status(200).json({
				product: product.toJSON(),
			});
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	};

	// GET /products/search?q= - Buscar por nombre
	search = async (req: Request, res: Response): Promise<void> => {
		try {
			const query = req.query.q as string;
			if (!query) {
				res
					.status(400)
					.json({ error: 'El parámetro de búsqueda "q" es requerido' });
				return;
			}

			const products = await this.productService.searchProducts(query);

			res.status(200).json({
				products: products.map((p) => p.toJSON()),
			});
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	// GET /products/low-stock - Productos con stock bajo
	getLowStock = async (req: Request, res: Response): Promise<void> => {
		try {
			const products = await this.productService.getLowStockProducts();
			res.status(200).json({
				products: products.map((p) => p.toJSON()),
			});
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	// GET /products/out-of-stock - Productos agotados
	getOutOfStock = async (req: Request, res: Response): Promise<void> => {
		try {
			const products = await this.productService.getOutOfStockProducts();
			res.status(200).json({
				products: products.map((p) => p.toJSON()),
			});
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	// GET /products/:id - Obtener producto por ID
	getById = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as string;
			const product = await this.productService.getProductById(id);

			res.status(200).json({
				product: product.toJSON(),
			});
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	};

	// PUT /products/:id - Actualizar producto
	update = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as string;
			const {
				name,
				description,
				categoryId,
				purchasePrice,
				salePrice,
				offerPrice,
				minStock,
				location,
				taxCode,
				isActive,
			} = req.body;

			const product = await this.productService.updateProduct(id, {
				name,
				description,
				categoryId,
				purchasePrice,
				salePrice,
				offerPrice,
				minStock,
				location,
				taxCode,
				isActive,
			});

			res.status(200).json({
				message: "Producto actualizado exitosamente",
				product: product.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	// PATCH /products/:id/stock - Ajustar stock
	adjustStock = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as string;
			const { stock } = req.body;

			if (stock === undefined) {
				res.status(400).json({ error: "El stock es requerido" });
				return;
			}

			const product = await this.productService.adjustStock(id, stock);

			res.status(200).json({
				message: "Stock actualizado exitosamente",
				product: product.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	// PATCH /products/:id/toggle - Activar/desactivar producto
	toggle = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as string;
			const product = await this.productService.toggleProduct(id);

			res.status(200).json({
				message: `Producto ${product.isActive ? "activado" : "desactivado"} exitosamente`,
				product: product.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	// DELETE /products/:id - Eliminar producto
	delete = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as string;
			await this.productService.deleteProduct(id);

			res.status(200).json({ message: "Producto eliminado exitosamente" });
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};
}
