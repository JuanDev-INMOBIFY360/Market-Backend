import archiver from "archiver";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { appDataSource } from "../config/database.config";

const execPromise = promisify(exec);

export class BackupService {
	private backupDir: string;

	constructor() {
		this.backupDir = path.join(__dirname, "../../backups");
		this.ensureBackupDir();
	}

	private ensureBackupDir(): void {
		if (!fs.existsSync(this.backupDir)) {
			fs.mkdirSync(this.backupDir, { recursive: true });
		}
	}

	// ============ BACKUP DE BASE DE DATOS (REAL) ============
	async createBackup(): Promise<{
		filename: string;
		size: number;
		createdAt: Date;
	}> {
		try {
			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			const filename = `backup_${timestamp}.sql`;
			const filepath = path.join(this.backupDir, filename);

			// Obtener configuración de la base de datos
			const dbConfig = appDataSource.options;
			const dbName = dbConfig.database as string;
			const dbUser = (dbConfig as any).username as string;
			const dbHost = (dbConfig as any).host as string;
			const dbPort = (dbConfig as any).port as number;

			// Comando pg_dump (requiere tener PostgreSQL instalado)
			const command = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -f "${filepath}"`;

			// Nota: Esto puede pedir contraseña. Para entornos de producción, se debe configurar .pgpass
			console.log(`Ejecutando backup: ${command}`);

			// Ejecutar pg_dump (simulado por ahora, para evitar errores en desarrollo)
			// En desarrollo, creamos un archivo de backup simulado
			if (process.env.NODE_ENV === "development") {
				fs.writeFileSync(
					filepath,
					`-- BACKUP SIMULADO\n-- Fecha: ${new Date().toISOString()}\n-- Base de datos: ${dbName}\n\n-- Aquí iría el contenido real del backup en producción.`,
				);
			} else {
				await execPromise(command, {
					env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD },
				});
			}

			const stats = fs.statSync(filepath);

			// Limpiar backups antiguos (más de 30 días)
			await this.cleanOldBackups();

			return {
				filename,
				size: stats.size,
				createdAt: new Date(),
			};
		} catch (error) {
			console.error("Error al crear backup:", error);
			throw new Error("No se pudo crear el backup");
		}
	}

	// ============ LISTAR BACKUPS ============
	async listBackups(): Promise<
		{ filename: string; size: number; createdAt: Date }[]
	> {
		this.ensureBackupDir();

		const files = fs.readdirSync(this.backupDir);
		const backups = [];

		for (const file of files) {
			if (file.endsWith(".sql")) {
				const stats = fs.statSync(path.join(this.backupDir, file));
				backups.push({
					filename: file,
					size: stats.size,
					createdAt: stats.birthtime,
				});
			}
		}

		// Ordenar por fecha descendente
		backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
		return backups;
	}

	// ============ RESTAURAR BACKUP ============
	async restoreBackup(filename: string): Promise<void> {
		const filepath = path.join(this.backupDir, filename);

		if (!fs.existsSync(filepath)) {
			throw new Error("Backup no encontrado");
		}

		const dbConfig = appDataSource.options;
		const dbName = dbConfig.database as string;
		const dbUser = (dbConfig as any).username as string;
		const dbHost = (dbConfig as any).host as string;
		const dbPort = (dbConfig as any).port as number;

		// Comando psql para restaurar
		const command = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f "${filepath}"`;

		console.log(`Restaurando backup: ${command}`);

		// En desarrollo, solo simulamos
		if (process.env.NODE_ENV === "development") {
			console.log(`[SIMULADO] Restaurando backup desde: ${filename}`);
		} else {
			await execPromise(command, {
				env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD },
			});
		}
	}

	// ============ ELIMINAR BACKUP ============
	async deleteBackup(filename: string): Promise<void> {
		const filepath = path.join(this.backupDir, filename);

		if (!fs.existsSync(filepath)) {
			throw new Error("Backup no encontrado");
		}

		fs.unlinkSync(filepath);
	}

	// ============ LIMPIAR BACKUPS ANTIGUOS (30 DÍAS) ============
	private async cleanOldBackups(): Promise<void> {
		const backups = await this.listBackups();
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		for (const backup of backups) {
			if (backup.createdAt < thirtyDaysAgo) {
				await this.deleteBackup(backup.filename);
				console.log(`Backup antiguo eliminado: ${backup.filename}`);
			}
		}
	}

	// ============ CREAR BACKUP COMPLETO (CON ARCHIVOS) ============
	async createFullBackup(): Promise<{
		filename: string;
		size: number;
		createdAt: Date;
	}> {
		// Primero crear backup de base de datos
		const dbBackup = await this.createBackup();

		// Crear archivo zip con el backup SQL
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const zipFilename = `full_backup_${timestamp}.zip`;
		const zipFilepath = path.join(this.backupDir, zipFilename);

		const output = fs.createWriteStream(zipFilepath);
		const archive = archiver("zip", { zlib: { level: 9 } });

		return new Promise((resolve, reject) => {
			output.on("close", async () => {
				// Eliminar el archivo SQL individual
				const sqlFilepath = path.join(this.backupDir, dbBackup.filename);
				if (fs.existsSync(sqlFilepath)) {
					fs.unlinkSync(sqlFilepath);
				}

				const stats = fs.statSync(zipFilepath);
				resolve({
					filename: zipFilename,
					size: stats.size,
					createdAt: new Date(),
				});
			});

			archive.on("error", reject);
			archive.pipe(output);
			archive.file(path.join(this.backupDir, dbBackup.filename), {
				name: dbBackup.filename,
			});
			archive.finalize();
		});
	}
}
