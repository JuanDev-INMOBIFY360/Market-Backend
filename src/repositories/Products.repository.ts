import { appDataSource } from "../config/database.config";
import { Products } from "../models/Products.model";
import { Repository,ILike,Between } from "typeorm";

export class ProductsRepository {

    private static instance: ProductsRepository
    private repo: Repository<Products>

    constructor() {
        this.repo = appDataSource.getRepository(Products)
    }

    public static getInstance(): ProductsRepository {
        if (!ProductsRepository.instance) {
            ProductsRepository.instance = new ProductsRepository()
        }
        return ProductsRepository.instance
    }

    async findAll(page: number = 1, limit: number = 50) : Promise<{products: Products[]; total: number}>{
        const  [products, total] = await this.repo.findAndCount({
            where: {isActive: true},
            relations: ['category'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
             take: limit
        })
         return { products, total };
    }

    async findAllWithInactive () : Promise<Products[]> {
        return await this.repo.find({
            relations: ['category'],
            order: { name: 'ASC' }
        })

    }

    async findById(id:string) : Promise <Products | null>{
        return await this.repo.findOne({
            where: {id},
            relations:['category']

        })
    }

     async findByBarcode(barcode: string): Promise<Products | null> {
        return await this.repo.findOne({
            where: { barcode },
            relations: ['category']
        });
    }
     async searchByName(query: string): Promise<Products[]> {
        return await this.repo.find({
            where: { 
                name: ILike(`%${query}%`),
                isActive: true 
            },
            relations: ['category'],
            take: 20
        });
    }

     async findLowStock(): Promise<Products[]> {
        return await this.repo.find({
            where: {
                isActive: true,
                stock: Between(1, 5)  // stock entre 1 y 5
            },
            order: { stock: 'ASC' }
        });
    }

    async findOutOfStock(): Promise<Products[]> {
        return await this.repo.find({
            where: { 
                isActive: true,
                stock: 0 
            },
            order: { name: 'ASC' }
        });
    }
     async save(product: Products): Promise<Products> {
        return await this.repo.save(product);
    }
     async update(id: string, data: Partial<Products>): Promise<Products | null> {
        await this.repo.update(id, data);
        return await this.findById(id);
    }
     async delete(id: string): Promise<boolean> {
        const result = await this.repo.update(id, { isActive: false });
        return result.affected !== null && result.affected !== undefined && result.affected > 0;
    }

     async hardDelete(id: string): Promise<boolean> {
        const result = await this.repo.delete(id);
        return result.affected !== null && result.affected !== undefined && result.affected > 0;
    }

    async adjustStock(id: string, newStock: number): Promise<Products | null> {
        if (newStock < 0) throw new Error('El stock no puede ser negativo');
        await this.repo.update(id, { stock: newStock });
        return await this.findById(id);
    }
}