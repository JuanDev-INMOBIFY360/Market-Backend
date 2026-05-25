// src/services/CashShift.service.ts (versión corregida)

import { CashMovement } from "../models/CashMovement.model";
import { CashShift } from "../models/CashShift.model";
import { CashMovementRepository } from "../repositories/CashMovement.repository";
import { CashShiftRepository } from "../repositories/CashShift.repository";

export class CashShiftService {
	private cashShiftRepository: CashShiftRepository;
	private cashMovementRepository: CashMovementRepository;

	constructor() {
		this.cashShiftRepository = CashShiftRepository.getInstance();
		this.cashMovementRepository = CashMovementRepository.getInstance(); // ← Ahora sí existe
	}

	async openShift(
		employeeId: string,
		openingBalance: number,
	): Promise<CashShift> {
		const currentShift =
			await this.cashShiftRepository.findCurrentShiftByEmployee(employeeId);
		if (currentShift) {
			throw new Error("Ya tienes un turno abierto");
		}

		if (openingBalance < 0) {
			throw new Error("El monto inicial no puede ser negativo");
		}

		const shift = new CashShift();
		shift.employeeId = employeeId;
		shift.openingTime = new Date();
		shift.openingBalance = openingBalance;
		shift.status = "open";

		const savedShift = await this.cashShiftRepository.save(shift);

		const openingMovement = new CashMovement();
		openingMovement.cashShiftId = savedShift.id;
		openingMovement.employeeId = employeeId;
		openingMovement.type = "opening";
		openingMovement.amount = openingBalance;
		openingMovement.paymentMethod = "cash";
		openingMovement.description = "Apertura de turno";
		await this.cashMovementRepository.save(openingMovement);

		return savedShift;
	}

	async closeShift(
		employeeId: string,
		closingBalance: number,
		notes?: string,
	): Promise<CashShift> {
		const currentShift =
			await this.cashShiftRepository.findCurrentShiftByEmployee(employeeId);
		if (!currentShift) {
			throw new Error("No tienes un turno abierto");
		}

		if (closingBalance < 0) {
			throw new Error("El monto final no puede ser negativo");
		}

		const movements = await this.cashMovementRepository.findByShift(
			currentShift.id,
		);

		let expectedBalance = currentShift.openingBalance;
		for (const movement of movements) {
			if (movement.type === "sale") expectedBalance += movement.amount;
			if (movement.type === "refund") expectedBalance -= movement.amount;
			if (movement.type === "expense") expectedBalance -= movement.amount;
			if (movement.type === "income") expectedBalance += movement.amount;
			if (movement.type === "withdrawal") expectedBalance -= movement.amount;
		}

		const difference = closingBalance - expectedBalance;

		currentShift.closingTime = new Date();
		currentShift.closingBalance = closingBalance;
		currentShift.expectedBalance = expectedBalance;
		currentShift.difference = difference;
		currentShift.status = "closed";
		if (notes) currentShift.notes = notes;

		return await this.cashShiftRepository.save(currentShift);
	}

	async getCurrentShift(employeeId: string): Promise<CashShift | null> {
		return await this.cashShiftRepository.findCurrentShiftByEmployee(
			employeeId,
		);
	}

	async getShiftById(id: string): Promise<CashShift | null> {
		return await this.cashShiftRepository.findById(id);
	}

	async getEmployeeShifts(employeeId: string): Promise<CashShift[]> {
		return await this.cashShiftRepository.findByEmployee(employeeId);
	}
}
