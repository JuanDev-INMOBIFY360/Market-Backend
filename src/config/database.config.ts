import { DataSource } from "typeorm";
import dotenv from 'dotenv'
import { Config } from "../models/Config.model";
import { Employee } from "../models/Employee.model";
import { CashShift } from "../models/CashShift.model";
import { CashMovement } from "../models/CashMovement.model";
import { Category } from '../models/Category.model';
import { Products } from "../models/Products.model";
import { Supplier } from "../models/Supplier.model";
import { Purchase } from "../models/Purchase.model";
import { PurchaseItem } from "../models/PurchaseItem.model";

Employee

dotenv.config()

export const appDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSOWRD,
    database: process.env.DB_DATABASE ,
    synchronize: true,
    logging: true,
    entities: [Config, Employee, CashShift, CashMovement, Category, Products, Supplier,Purchase, PurchaseItem],
})