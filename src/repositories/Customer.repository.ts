import { appDataSource } from "../config/database.config";
import { Customer } from "../models/Customer.model";
import { Repository, ILike } from "typeorm";


export class CustomerRepository {

    private static instance: CustomerRepository
    private repo: Repository<Customer>

    constructor() {
        this.repo = appDataSource.getRepository(Customer)
    }

    public static getInstance(): CustomerRepository {
        if (!CustomerRepository) {
            CustomerRepository.instance = new CustomerRepository();
        }
        return CustomerRepository.instance
    }

    async getAll(): Promise<Customer[]> {
        return await this.repo.find({
            where: { isActive: true },
            order: { fullName: 'ASC' }
        })
    }

    async findById(id: string): Promise<Customer | null> {
        return await this.repo.findOneBy({ id })
    }

    async findByDocument(documentNumber: string): Promise<Customer | null> {
        return this.repo.findOneBy({ documentNumber })
    }
    async searchByName(query: string): Promise<Customer[]> {
        return await this.repo.find({
            where: { fullName: ILike(`%${query}%`), isActive: true },
            take: 20
        })
    }

    async save(customer: Customer): Promise<Customer> {
        return await this.repo.save(customer);
    }

    async update(id: string, data: Partial<Customer>): Promise<Customer | null> {
        await this.repo.update(id, data)
        return await this.findById(id)
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repo.update(id, { isActive: false })
        return result.affected !== null && result.affected !== undefined && result.affected > 0;
    }

    async addPoints(id: string, point: number): Promise<Customer | null> {
        const custormer = await this.findById(id);
        if (!custormer) return null
        custormer.points += point
        return await this.repo.save(custormer)
    }

    async redeemPoints(id: string, point: number): Promise<Customer | null> {
        const customer = await this.findById(id)
        if (!customer) return null
        if (customer.points < point) {
            throw new Error("Puntos insuficientes ");
        }
        customer.points -= point
        return await this.repo.save(customer)
    }
}