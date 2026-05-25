import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { CategoryService } from "../services/Category.service";

export class CategoryController {
	private categoryService: CategoryService;

	constructor() {
		this.categoryService = new CategoryService();
	}

	create = async (req: AuthRequest, res: Response): Promise<void> => {
		try {
			const userId = req.user?.id;
			if (!userId) {
				res.status(401).json({ error: "No autenticado" });
				return;
			}

			const { name, description, parentId, taxCode, displayOrder } = req.body;

			if (!name) {
				res.status(400).json({ error: "El nombre es requerido" });
				return;
			}

			const category = await this.categoryService.createCategory(
				name,
				userId,
				description,
				parentId,
				taxCode,
				displayOrder,
			);

			res.status(201).json({
				message: "Categoría creada exitosamente",
				category: category.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	getAll = async (req: Request, res: Response): Promise<void> => {
		try {
			const categories = await this.categoryService.getAllCategories();
			res.status(200).json({
				categories: categories.map((c) => c.toJSON()),
			});
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	getTree = async (req: Request, res: Response): Promise<void> => {
		try {
			const tree = await this.categoryService.getTree();
			res.status(200).json({
				categories: tree,
			});
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	getById = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as any;
			const category = await this.categoryService.getCategoryById(id);
			res.status(200).json({
				category: category.toJSON(),
			});
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	};

	update = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as any;
			const { name, description, taxCode, displayOrder } = req.body;

			const category = await this.categoryService.updateCategory(id, {
				name,
				description,
				taxCode,
				displayOrder,
			});

			res.status(200).json({
				message: "Categoría actualizada exitosamente",
				category: category.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	delete = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as any;
			await this.categoryService.deleteCategory(id);
			res.status(200).json({ message: "Categoría eliminada exitosamente" });
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	toggle = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as string;
			const category = await this.categoryService.toggleCategory(id);
			res.status(200).json({
				message: `Categoría ${category.isActive ? "activada" : "desactivada"} exitosamente`,
				category: category.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};
}
