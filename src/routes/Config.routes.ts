import { Router } from "express";
import { ConfigController } from "../controllers/Config.controller";

export class ConfigRoutes {
	private router: Router;
	private configController: ConfigController;

	constructor() {
		this.router = Router();
		this.configController = new ConfigController();
		this.initRoutes();
	}

	private initRoutes(): void {
		this.router.get("/", this.configController.getAllConfig);
		this.router.get("/:key", this.configController.getConfigByKey);
		this.router.put("/:key", this.configController.updatedConfig);
	}
	public getRouter(): Router {
		return this.router;
	}
}
