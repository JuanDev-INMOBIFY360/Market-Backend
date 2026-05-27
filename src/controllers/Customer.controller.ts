import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { CustomerService } from "../services/Customer.service";

export class CustomerController {
	private customerService: CustomerService;

	constructor() {
		this.customerService = new CustomerService();
	}

	create = async (req: AuthRequest, res: Response): Promise<void> => {
		try {
			const { documentNumber, fullName, documentType, phone, email, address } =
				req.body;
			if (!documentNumber || !fullName) {
				res.status(400).json({ error: "Documento y nombre son requeridos" });
				return;
			}
			const customer = await this.customerService.save(
				documentNumber,
				fullName,
				documentType,
				phone,
				email,
				address,
			);
			res.status(201).json({
				message: "Cliente creado exitosamente",
				customer: customer.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	getAll = async (_req: Request, res: Response): Promise<void> => {
		try {
			const customers = await this.customerService.getAllCustomers();
			res.status(200).json({
				customers: customers.map((c) => c.toJSON()),
			});
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	};

	getByDocument = async (req: Request, res: Response): Promise<void> => {
		try {
			const document = req.params.document as string;
			const customer =
				await this.customerService.getCustomerByDocument(document);
			res.status(200).json({
				customer: customer.toJSON(),
			});
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	};
	getById = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as string;
			const customer = await this.customerService.getCustomerById(id);
			res.status(200).json({
				customer: customer.toJSON(),
			});
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	};

	update = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as string;
			const { fullName, phone, email, address } = req.body;

			const customer = await this.customerService.updateCustomer(id, {
				fullName,
				phone,
				email,
				address,
			});

			res.status(200).json({
				message: "Cliente actualizado exitosamente",
				customer: customer.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};

	getPointsHistory = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as string;
			const history = await this.customerService.getPointHistory(id);
			res.status(200).json({
				history: history.map((h) => h.toJSON()),
			});
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	};

	addPoints = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id as string;
			const { points, reason } = req.body;

			if (!points || points <= 0) {
				res
					.status(400)
					.json({ error: "La cantidad de puntos debe ser positiva" });
				return;
			}
			if (!reason) {
				res.status(400).json({ error: "El motivo es requerido" });
				return;
			}

			const customer = await this.customerService.addPointsManually(
				id,
				points,
				reason,
			);
			res.status(200).json({
				message: `Se agregaron ${points} puntos al cliente`,
				customer: customer.toJSON(),
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	};
}
