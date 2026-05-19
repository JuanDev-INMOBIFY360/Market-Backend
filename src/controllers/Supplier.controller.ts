import { Request, Response } from 'express';
import { SupplierService } from '../services/Supplier.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { error } from 'node:console';


export class SupplierController {

    private supplierService: SupplierService

    constructor() {
        this.supplierService = new SupplierService();
    }

    create = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { name, nit, contactName, phone, email, address, creditDays } = req.body
            if (!name) {
                res.status(400).json({ error: 'el nombre es requerido' })
                return
            }
            const supplier = await this.supplierService.createSupplier(name, nit, contactName, phone, email, address, creditDays)
            res.status(201).json({
                message:'Proveedor creado',
                supplier:supplier.toJSON
            })
        } catch (error:any) {
            res.status(400).json({error: error.message})
        }
    }

     getAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const suppliers = await this.supplierService.getAllSupplier();
            res.status(200).json({
                suppliers: suppliers.map(s => s.toJSON())
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        try {
            const  id  = req.params.id as string;
            const supplier = await this.supplierService.getSupplierById(id);
            res.status(200).json({
                supplier: supplier.toJSON()
            });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const  id  = req.params.id as string;
            const { name, nit, contactName, phone, email, address, creditDays, isActive } = req.body;

            const supplier = await this.supplierService.updateSupplier(id, {
                name, nit, contactName, phone, email, address, creditDays, isActive
            });

            res.status(200).json({
                message: 'Proveedor actualizado exitosamente',
                supplier: supplier.toJSON()
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const  id  = req.params.id as string;
            await this.supplierService.deleteSupplier(id);
            res.status(200).json({ message: 'Proveedor desactivado exitosamente' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}

