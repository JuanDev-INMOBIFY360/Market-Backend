// src/services/Employee.service.ts

import bcrypt from "bcrypt";
import { Employee, type EmployeeRole } from "../models/Employee.model";
import { CashShiftRepository } from "../repositories/CashShift.repository";
import { EmployeeRepository } from "../repositories/Employee.repository";
import { JWTUtil } from "../utils/jwt.util";

export class EmployeeService {
	private employeeRepository: EmployeeRepository;
	private cashShiftRepository: CashShiftRepository;

	constructor() {
		this.employeeRepository = EmployeeRepository.getInstance();
		this.cashShiftRepository = CashShiftRepository.getInstance();
	}

	async createEmployee(
		code: string,
		fullName: string,
		documentNumber: string,
		role: EmployeeRole,
		password: string,
		documentType: string = "CC",
		phone?: string,
		email?: string,
		hireDate?: Date,
		createdBy?: string,
	): Promise<Employee> {
		// Validaciones
		if (!code || code.length < 3) {
			throw new Error("El código debe tener al menos 3 caracteres");
		}
		if (!fullName || fullName.length < 2) {
			throw new Error("El nombre debe tener al menos 2 caracteres");
		}
		if (!documentNumber) {
			throw new Error("El número de documento es requerido");
		}
		if (!password || password.length < 6) {
			throw new Error("La contraseña debe tener al menos 6 caracteres");
		}

		// Verificar que no exista otro empleado con el mismo código o documento
		const existingByCode = await this.employeeRepository.findByCode(code);
		if (existingByCode) {
			throw new Error(`Ya existe un empleado con el código ${code}`);
		}

		const existingByDoc =
			await this.employeeRepository.findByDocumentNumber(documentNumber);
		if (existingByDoc) {
			throw new Error(
				`Ya existe un empleado con el documento ${documentNumber}`,
			);
		}

		// Solo puede existir un owner
		if (role === "owner") {
			const ownerCount = await this.employeeRepository.countByRole("owner");
			if (ownerCount > 0) {
				throw new Error(
					"Ya existe un dueño del sistema. Solo puede haber uno.",
				);
			}
		}

		// Encriptar contraseña
		const passwordHash = await bcrypt.hash(password, 10);

		const employee = new Employee();
		employee.code = code;
		employee.fullName = fullName;
		employee.documentType = documentType;
		employee.documentNumber = documentNumber;
		employee.phone = phone || "";
		employee.email = email || "";
		employee.role = role;
		employee.passwordHash = passwordHash;
		employee.mustChangePassword = true;
		employee.isActive = true;
		employee.hireDate = hireDate || new Date();
		employee.createdBy = createdBy || "";

		return await this.employeeRepository.save(employee);
	}

	async getAllEmployees(): Promise<Employee[]> {
		return await this.employeeRepository.findAll();
	}

	async getEmployeeById(id: string): Promise<Employee | null> {
		const employee = await this.employeeRepository.findById(id);
		if (!employee) {
			throw new Error("Empleado no encontrado");
		}
		return employee;
	}

	async updateEmployee(
		id: string,
		data: Partial<Employee>,
	): Promise<Employee | null> {
		const employee = await this.employeeRepository.findById(id);
		if (!employee) {
			throw new Error("Empleado no encontrado");
		}

		// No permitir cambiar rol a owner si ya existe otro
		if (data.role === "owner") {
			const ownerCount = await this.employeeRepository.countByRole("owner");
			const isOwner = employee.role === "owner";
			if (ownerCount > 0 && !isOwner) {
				throw new Error(
					"Ya existe un dueño del sistema. Solo puede haber uno.",
				);
			}
		}

		return await this.employeeRepository.update(id, data);
	}

	async deleteEmployee(id: string): Promise<boolean> {
		const employee = await this.employeeRepository.findById(id);
		if (!employee) {
			throw new Error("Empleado no encontrado");
		}

		// No permitir eliminar al único owner
		if (employee.role === "owner") {
			const ownerCount = await this.employeeRepository.countByRole("owner");
			if (ownerCount === 1) {
				throw new Error("No se puede eliminar al único dueño del sistema");
			}
		}

		return await this.employeeRepository.delete(id);
	}

	async changePassword(
		id: string,
		oldPassword: string,
		newPassword: string,
	): Promise<void> {
		const employee = await this.employeeRepository.findById(id);
		if (!employee) {
			throw new Error("Empleado no encontrado");
		}

		const isValid = await bcrypt.compare(oldPassword, employee.passwordHash);
		if (!isValid) {
			throw new Error("Contraseña actual incorrecta");
		}

		if (newPassword.length < 6) {
			throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
		}

		const newPasswordHash = await bcrypt.hash(newPassword, 10);
		await this.employeeRepository.update(id, {
			passwordHash: newPasswordHash,
			mustChangePassword: false,
		});
	}

	async login(
		code: string,
		password: string,
	): Promise<{ employee: Employee; token: string }> {
		const employee = await this.employeeRepository.findByCode(code);
		if (!employee) {
			throw new Error("Código de empleado incorrecto");
		}
		if (!employee.isActive) {
			throw new Error("Usuario inactivo. Contacte al administrador");
		}
		const isValid = await bcrypt.compare(password, employee.passwordHash);
		if (!isValid) {
			throw new Error("Contraseña incorrecta");
		}

		const activeShift =
			await this.cashShiftRepository.findCurrentShiftByEmployee(employee.id);
		const shiftId = activeShift?.id || null;
		const token = JWTUtil.generateToken({
			id: employee.id,
			code: employee.code,
			role: employee.role,
			shiftId: shiftId,
		});

		return { employee, token };
	}
}
