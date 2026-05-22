import { CustomerRepository } from '../repositories/Customer.repository';
import { PointsHistoryRepository } from '../repositories/PointsHistory.repository';
import { Customer } from '../models/Customer.model';
import { PointsHistory } from '../models/PointsHistory.model';
import { validate as isUUID } from 'uuid';
import { UUID } from 'typeorm/driver/mongodb/bson.typings.js';


export class CustomerService {
    private customerRepository: CustomerRepository
    private pointsHistoryRepository: PointsHistoryRepository


    constructor() {
        this.customerRepository = CustomerRepository.getInstance();
        this.pointsHistoryRepository = PointsHistoryRepository.getInstance();
    }

    async save(documentNumber: string,
        fullName: string,
        documentType: string = 'CC',
        phone?: string,
        email?: string,
        address?: string): Promise<Customer> {
        if (!documentNumber) {
            throw new Error('El número de documento es requerido');
        }
        if (!fullName || fullName.length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }

        const existing = await this.customerRepository.findByDocument(documentNumber);
        if (existing) {
            throw new Error(`Ya existe un cliente con el documento ${documentNumber}`);
        }

        const customer = new Customer();
        customer.documentType = documentType
        customer.documentNumber = documentNumber
        customer.fullName = fullName
        customer.phone = phone || ''
        customer.email = email || ''
        customer.address = address || ''
        customer.points = 0
        customer.totalSpent = 0
        customer.isActive = true

        return await this.customerRepository.save(customer)
    }

    async getAllCustomers(): Promise<Customer[]> {
        return await this.customerRepository.getAll();
    }
    async getCustomerById(id: string): Promise<Customer> {
        if (!isUUID(id)) {
            throw new Error('ID de cliente inválido');
        }
        const customer = await this.customerRepository.findById(id)
        if (!customer) {
            throw new Error("ciente no encontrado");

        }
        return customer
    }

    async getCustomerByDocument(documentNumber: string): Promise<Customer> {
        const customer = await this.customerRepository.findByDocument(documentNumber);
        if (!customer) {
            throw new Error('Cliente no encontrado');
        }
        return customer;
    }

    async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
        const customer = await this.getCustomerById(id);
        const updated = await this.customerRepository.update(id, data);
        if (!updated) {
            throw new Error('Error al actualizar el cliente');
        }
        return updated;
    }

    async getPointHistory(customerId: string): Promise<PointsHistory[]> {
        await this.getCustomerById(customerId)
        return await this.pointsHistoryRepository.findByCustomer(customerId)
    }

    async addPointsManually(CustomerId: string, points: number, reason: string): Promise<Customer> {
        if (points <= 0) {
            throw new Error("Los puntos deben ser número positivos");

        }

        const customer = await this.getCustomerById(CustomerId)
        if (!customer) {
            throw new Error("Cliente no encontrado");

        }
        const updated = await this.customerRepository.addPoints(CustomerId, points)
        if (!updated) {
            throw new Error('Error al agregar puntos');
        }

        const history = new PointsHistory();
        history.customerId = CustomerId
        history.points = points
        history.type = 'earned'
        history.reason = reason
        await this.pointsHistoryRepository.save(history);
        return updated
    }

    async redeemPoints(customerId: string, points: number, saleId: string): Promise<Customer> {
        if (points <= 0) {
            throw new Error("Los puntos deben ser número positivos");
        }

        const customer = await this.getCustomerById(customerId)
        if (customer.points < 0) {
            throw new Error(`Puntos insuficientes. Tiene ${customer.points} puntos`);
        }

        const updated = await this.customerRepository.redeemPoints(customerId, points);
        if (!updated) {
            throw new Error("Error al canjear puntos");
        }

        const history = new PointsHistory();
        history.customerId = customerId
        history.type = 'redeemed';
        history.points = points;
        history.saleId = saleId;
        history.reason = `Canje en venta`;

        await this.pointsHistoryRepository.save(history)

        return updated

    }

    async earnPointsFromSale(customerId: string, saleId: string, total: number): Promise<Customer> {
        const pointsConfig = await this.getPointsPercentage();
        const pointsEarned = Math.floor(total * (pointsConfig / 100));

        if (pointsEarned === 0) {
            return await this.getCustomerById(customerId);
        }

        const updated = await this.customerRepository.addPoints(customerId, pointsEarned)
          if (!updated) {
            throw new Error('Error al agregar puntos');
        }


        //actualizar total gastados 
        const customer =await this.getCustomerById(customerId)
        const  newTotalSpent = (customer.totalSpent  || 0)  + total;
        await this.customerRepository.update(customerId, {totalSpent : newTotalSpent})

        const history = new  PointsHistory();
        history.customerId = customerId
        history.type = 'earned';
        history.points = pointsEarned;
        history.saleId = saleId;
        history.reason = `Compra #${saleId}`;
        await this.pointsHistoryRepository.save(history)
        return updated
        
    }

    private async getPointsPercentage() {
        return 1
    }

}