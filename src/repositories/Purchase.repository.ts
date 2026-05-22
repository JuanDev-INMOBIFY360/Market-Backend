import { Repository } from "typeorm";
import { appDataSource } from "../config/database.config";
import { Purchase } from "../models/Purchase.model";



export class PurchaseRepository  {

    private static instance : PurchaseRepository
    private repo : Repository<Purchase>

    constructor(){
        this.repo = appDataSource.getRepository(Purchase)
    }

    public static getInstance() : PurchaseRepository{
        if (!PurchaseRepository.instance) {
            PurchaseRepository.instance = new PurchaseRepository()
        }
        return PurchaseRepository.instance;
    }

    async findAll(): Promise<Purchase[]> {
        return await this.repo.find({
            relations: ['supplier', 'employee', 'items', 'items.products'],
            order: { purchaseDate: 'DESC' }
        });
    }

    async findById(id: string): Promise<Purchase | null> {
    return await this.repo.findOne({
        where: { id },
        relations: ['supplier', 'employee', 'items', 'items.products']  
    });
}

    async save (purchase: Purchase) : Promise <Purchase>{
        return await this.repo.save(purchase)
    }

    async update(id:string, data:Partial<Purchase>) : Promise <Purchase | null> {
        await this.repo.update(id,data)
        return this.findById(id)
    }

}