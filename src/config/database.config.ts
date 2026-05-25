import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { AuditLog } from "../models/AuditLog.model";
import { CashMovement } from "../models/CashMovement.model";
import { CashShift } from "../models/CashShift.model";
import { Category } from "../models/Category.model";
import { Config } from "../models/Config.model";
import { Customer } from "../models/Customer.model";
import { Employee } from "../models/Employee.model";
import { InventoryMovement } from "../models/InventoryMovement.model";
import { PointsHistory } from "../models/PointsHistory.model";
import { Products } from "../models/Products.model";
import { Promotion } from "../models/Promotion.model";
import { Purchase } from "../models/Purchase.model";
import { PurchaseItem } from "../models/PurchaseItem.model";
import { Sale } from "../models/Sale.model";
import { SaleItem } from "../models/SaleItem.model";
import { Supplier } from "../models/Supplier.model";

dotenv.config();

export const appDataSource = new DataSource({
	type: "postgres",
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT || "5432"),
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSOWRD,
	database: process.env.DB_DATABASE,
	synchronize: true,
	logging: true,
	entities: [
		Config,
		Employee,
		CashShift,
		CashMovement,
		Category,
		Products,
		Supplier,
		Purchase,
		PurchaseItem,
		Sale,
		SaleItem,
		Customer,
		PointsHistory,
		Promotion,
		InventoryMovement,
		AuditLog,
	],
});
