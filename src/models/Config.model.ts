import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity({ name: "system_config" })
export class Config {
	@PrimaryColumn({ type: "varchar", length: 50 })
	key!: string;

	@Column({ type: "text" })
	value!: string;

	@Column({ type: "text", nullable: true })
	description!: string;

	@Column({ type: "varchar", length: 100, nullable: true })
	updatedBy!: string;

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date;
}

export const defaultConfig = [
	{
		key: "mode",
		value: "simple",
		description: "Modo de operación: simple o enterprise",
	},
	{
		key: "business_name",
		value: "Mi Supermercado",
		description: "Nombre del negocio",
	},
	{
		key: "business_nit",
		value: "900.123.456-7",
		description: "NIT del negocio",
	},
	{ key: "business_address", value: "", description: "Dirección del negocio" },
	{ key: "business_phone", value: "", description: "Teléfono del negocio" },
	{ key: "currency", value: "COP", description: "Moneda" },
	{ key: "iva_general", value: "19", description: "IVA general en porcentaje" },
	{
		key: "consumption_tax",
		value: "4",
		description: "Impuesto al consumo en porcentaje",
	},
	{
		key: "points_enabled",
		value: "false",
		description: "Activar sistema de puntos",
	},
	{
		key: "points_percentage",
		value: "1",
		description: "Porcentaje de puntos por compra",
	},
	{
		key: "point_value",
		value: "10",
		description: "Valor de cada punto en COP",
	},
	{
		key: "electronic_invoice",
		value: "false",
		description: "Activar facturación electrónica",
	},
	{
		key: "cashier_shifts",
		value: "false",
		description: "Activar turnos de caja",
	},
];
