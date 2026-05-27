// src/controllers/Employee.controller.ts
import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { EmployeeService } from "../services/Employee.service";

export class EmployeeController {
	private employeeService: EmployeeService;

	constructor() {
		this.employeeService = new EmployeeService();
	}

	create = async (req: Request, res: Response): Promise<void> => {
		try {
			const {
				code,
				fullName,
				documentNumber,
				role,
				password,
				documentType,
				phone,
				email,
				hireDate,
			} = req.body;

			if (!code || !fullName || !documentNumber || !role || !password) {
				res.status(400).json({
					error:
						"Faltan campos requeridos: code, fullName, documentNumber, role, password",
				});
				return;
			}

			const employee = await this.employeeService.createEmployee(
				code,
				fullName,
				documentNumber,
				role,
				password,
				documentType,
				phone,
				email,
				hireDate ? new Date(hireDate) : undefined,
			);

			res.status(201).json({
				message: "Empleado creado exitosamente",
				employee: employee.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	getAll = async (_req: Request, res: Response): Promise<void> => {
		try {
			const employees = await this.employeeService.getAllEmployees();
			res.status(200).json({
				message: "Lista de empleados",
				employees: employees.map((e) => e.toJSON()),
			});
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	getById = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as any;
			const employee = await this.employeeService.getEmployeeById(id);

			if (!employee) {
				res.status(404).json({ error: "Empleado no encontrado" });
				return;
			}

			res.status(200).json({
				message: "Empleado encontrado",
				employee: employee.toJSON(),
			});
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	};
	update = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as any;
			const { fullName, phone, email, role, isActive } = req.body;

			const employee = await this.employeeService.updateEmployee(id, {
				fullName,
				phone,
				email,
				role,
				isActive,
			});

			res.status(200).json({
				message: "Empleado actualizado exitosamente",
				employee: employee?.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	delete = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as any;
			await this.employeeService.deleteEmployee(id);
			res.status(200).json({ message: "Empleado desactivado exitosamente" });
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	changePassword = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as any;
			const { oldPassword, newPassword } = req.body;

			if (!oldPassword || !newPassword) {
				res.status(400).json({ error: "Faltan las contraseñas" });
				return;
			}

			await this.employeeService.changePassword(id, oldPassword, newPassword);
			res.status(200).json({ message: "Contraseña cambiada exitosamente" });
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	login = async (req: Request, res: Response): Promise<void> => {
		try {
			const { code, password } = req.body;
			if (!code || !password) {
				throw new Error("Codigo y contraseña requeridos");
			}
			const { employee, token } = await this.employeeService.login(
				code,
				password,
			);
			res.status(200).json({
				message: "login exitoso",
				employee: employee.toJSON(),
				token,
			});
		} catch (error: any) {
			res.status(401).json({ error: error.message });
		}
	};

	getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
		try {
			res.status(200).json({
				message: "Perfil obtenido exitosamente",
				user: req.user,
			});
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};
}
