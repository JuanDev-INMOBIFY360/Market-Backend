import { CategoryRepository } from '../repositories/Category.repository';
import { Category } from '../models/Category.model';
import { validate } from 'uuid';

export class CategoryService {
    private categoryRepository: CategoryRepository;

    constructor() {
        this.categoryRepository = CategoryRepository.getInstance();
    }

    async createCategory(
        name: string,
        createdBy: string,
        description?: string,
        parentId?: string,
        taxCode?: string,
        displayOrder?: number
    ): Promise<Category> {
        if (!name || name.length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }

        // Validar padre si existe
        if (parentId) {
            if (!validate(parentId)) {
                throw new Error('ID de categoría padre inválido');
            }
            const parent = await this.categoryRepository.findById(parentId);
            if (!parent) {
                throw new Error('La categoría padre no existe');
            }
        }

        
        const existing = await this.categoryRepository.findByName(name, parentId);
        if (existing) {
            throw new Error('Ya existe una categoría con este nombre en este nivel');
        }

        const category = new Category();
        category.name = name;
        category.description = description || '';
        category.parentId = parentId ?? null;
        category.taxCode = taxCode || 'A';
        category.displayOrder = displayOrder || 0;
        category.isActive = true;
        category.createdBy = createdBy;

        return await this.categoryRepository.save(category);
    }

    async getAllCategories(): Promise<Category[]> {
        return await this.categoryRepository.findAllActive();
    }

    async getTree(): Promise<any[]> {
        return await this.categoryRepository.getTree();
    }

    async getCategoryById(id: string): Promise<Category> {
        if (!validate(id)) {
            throw new Error('ID de categoría inválido');
        }
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            throw new Error('Categoría no encontrada');
        }
        return category;
    }

    async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
        const category = await this.getCategoryById(id);

        if (data.name && data.name !== category.name) {
            const existing = await this.categoryRepository.findByName(data.name, category.parentId ?? undefined);
            if (existing && existing.id !== id) {
                throw new Error('Ya existe una categoría con este nombre en este nivel');
            }
        }

        const updated = await this.categoryRepository.update(id, data);
        if (!updated) {
            throw new Error('Error al actualizar la categoría');
        }
        return updated;
    }

    async deleteCategory(id: string): Promise<void> {
        const category = await this.getCategoryById(id);

        // Verificar si tiene productos (cuando implementemos productos)
        const hasProducts = await this.categoryRepository.hasProducts(id);
        if (hasProducts) {
            throw new Error('No se puede eliminar una categoría que tiene productos asociados');
        }

        // Verificar si tiene subcategorías
        const children = await this.categoryRepository.findAllActive();
        const hasChildren = children.some(c => c.parentId === id);
        if (hasChildren) {
            throw new Error('No se puede eliminar una categoría que tiene subcategorías');
        }

        await this.categoryRepository.delete(id);
    }

    async toggleCategory(id: string): Promise<Category> {
        const category = await this.getCategoryById(id);
        const updated = await this.categoryRepository.update(id, { isActive: !category.isActive });
        if (!updated) {
            throw new Error('Error al cambiar el estado de la categoría');
        }
        return updated;
    }
}