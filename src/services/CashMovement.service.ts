import {
	CashMovement,
	MovementType,
	PaymentMethod,
} from "../models/CashMovement.model";
import { CashMovementRepository } from "../repositories/CashMovement.repository";
import { CashShiftRepository } from "../repositories/CashShift.repository";

export class CashMovementService {
	private cashMovementRepository: CashMovementRepository;
	private cashShiftRepository: CashShiftRepository;
	constructor() {
		this.cashMovementRepository = CashMovementRepository.getInstance();
		this.cashShiftRepository = CashShiftRepository.getInstance();
	}

	async registerExpense(
		shiftId: string,
		employeeId: string,
		amount: number,
		description: string,
		receiptNumber?: string,
	): Promise<CashMovement> {
		const shift = await this.cashShiftRepository.findById(shiftId);
		if (!shift || shift.status !== "open") {
			throw new Error("No hay un turno de caja abierto");
		}
		if (amount < 0) {
			throw new Error("El monto debe ser un valor positivo");
		}
		if (!description || description.trim() === "") {
			throw new Error("La descripción es requerida");
		}
		const movement = new CashMovement();
		movement.cashShiftId = shiftId;
		movement.employeeId = employeeId;
		movement.type = "expense";
		movement.amount = amount;
		movement.paymentMethod = "cash";
		movement.description = `${description}${receiptNumber ? ` - Comprobante: ${receiptNumber}` : ""}`;
		return await this.cashMovementRepository.save(movement);
	}

	async registerIncome(
		shiftId: string,
		employeeId: string,
		amount: number,
		description: string,
		reference?: string,
	): Promise<CashMovement> {
		const shift = await this.cashShiftRepository.findById(shiftId);
		if (!shift || shift.status !== "open") {
			throw new Error("No hay un turno de caja abierto");
		}

		if (amount <= 0) {
			throw new Error("El monto del ingreso debe ser positivo");
		}

		if (!description || description.trim() === "") {
			throw new Error("La descripción del ingreso es requerida");
		}

		const movement = new CashMovement();
		movement.cashShiftId = shiftId;
		movement.employeeId = employeeId;
		movement.type = "income";
		movement.amount = amount;
		movement.paymentMethod = "cash";
		movement.description = `${description}${reference ? ` - Referencia: ${reference}` : ""}`;

		return await this.cashMovementRepository.save(movement);
	}

	async registerWithdrawal(
		shiftId: string,
		employeeId: string,
		amount: number,
		description: string,
	): Promise<CashMovement> {
		const shift = await this.cashShiftRepository.findById(shiftId);
		if (!shift || shift.status !== "open") {
			throw new Error("No hay un turno de caja abierto");
		}

		if (amount <= 0) {
			throw new Error("El monto del retiro debe ser positivo");
		}

		if (!description || description.trim() === "") {
			throw new Error("La descripción del retiro es requerida");
		}

		const movement = new CashMovement();
		movement.cashShiftId = shiftId;
		movement.employeeId = employeeId;
		movement.type = "withdrawal";
		movement.amount = amount;
		movement.paymentMethod = "cash";
		movement.description = `Retiro de caja: ${description}`;

		return await this.cashMovementRepository.save(movement);
	}

	async getShiftMovements(shiftId: string): Promise<CashMovement[]> {
		const shift = await this.cashShiftRepository.findById(shiftId);
		if (!shift) {
			throw new Error("Turno no encontrado");
		}
		return await this.cashMovementRepository.findByShift(shiftId);
	}

	async getShiftSummary(shiftId: string): Promise<{
		totalSales: number;
		totalExpenses: number;
		totalIncome: number;
		totalWithdrawals: number;
		netCash: number;
	}> {
		const movements = await this.cashMovementRepository.findByShift(shiftId);

		let totalSales = 0;
		let totalExpenses = 0;
		let totalIncome = 0;
		let totalWithdrawals = 0;

		for (const movement of movements) {
			switch (movement.type) {
				case "sale":
					totalSales += movement.amount;
					break;
				case "expense":
					totalExpenses += movement.amount;
					break;
				case "income":
					totalIncome += movement.amount;
					break;
				case "withdrawal":
					totalWithdrawals += movement.amount;
					break;
			}
		}

		const netCash = totalSales + totalIncome - totalExpenses - totalWithdrawals;

		return {
			totalSales,
			totalExpenses,
			totalIncome,
			totalWithdrawals,
			netCash,
		};
	}
}
