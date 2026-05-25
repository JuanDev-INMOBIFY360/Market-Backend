import { validate as isUUID } from "uuid";
import { Supplier } from "../models/Supplier.model";
import { SupplierRepository } from "../repositories/Supplier.repository";

export class SupplierService {
	private supplierRepository: SupplierRepository;

	constructor() {
		this.supplierRepository = SupplierRepository.getInstance();
	}

	async createSupplier(
		name: string,
		nit?: string,
		contactName?: string,
		phone?: string,
		email?: string,
		address?: string,
		creditDays?: number,
	): Promise<Supplier> {
		if (!name || name.length < 2) {
			throw new Error("El nombre debe tener al menos 2 caracteres");
		}

		if (nit) {
			const existing = await this.supplierRepository.findByNit(nit);
			if (existing) {
				throw new Error(`Ya existe un proveedor con el NIT ${nit}`);
			}
		}
		const supplier = new Supplier();
		supplier.name = name;
		supplier.nit = nit || "";
		supplier.contactName = contactName || "";
		supplier.phone = phone || "";
		supplier.email = email || "";
		supplier.address = address || "";
		supplier.creditDays = creditDays || 0;
		supplier.isActive = true;

		return await this.supplierRepository.save(supplier);
	}

	async getAllSupplier(): Promise<Supplier[]> {
		return await this.supplierRepository.findAll();
	}

	async getSupplierById(id: string): Promise<Supplier> {
		if (!isUUID(id)) {
			throw new Error("ID de proveedor inválido");
		}

		const supplier = await this.supplierRepository.findById(id);
		if (!supplier) {
			throw new Error("Proveedor no encontrado");
		}
		return supplier;
	}

	async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
		const supplier = await this.getSupplierById(id);

		if (data.nit && data.nit !== supplier.nit) {
			const existing = await this.supplierRepository.findByNit(data.nit);
			if (existing && existing.id !== id) {
				throw new Error(`Ya existe un proveedor con el NIT ${data.nit}`);
			}
		}

		const updated = await this.supplierRepository.update(id, data);
		if (!updated) {
			throw new Error("Error al actualizar el proveedor");
		}
		return updated;
	}

	async deleteSupplier(id: string): Promise<void> {
		await this.getSupplierById(id);
		await this.supplierRepository.delete(id);
	}
}
