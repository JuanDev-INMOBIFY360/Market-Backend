import { appDataSource } from "../config/database.config";
import { Config, defaultConfig } from "../models/Config.model";
import { Repository } from "typeorm";

export class ConfigRepository {
    private static instance: ConfigRepository;
    private repo: Repository<Config>;

    private constructor() {
        this.repo = appDataSource.getRepository(Config);
    }

    public static getInstance(): ConfigRepository {
        if (!ConfigRepository.instance) {
            ConfigRepository.instance = new ConfigRepository();
        }
        return ConfigRepository.instance;
    }

    async initDefaultConfigs() : Promise <void>{
        for(const config of defaultConfig){
            const exist =  await this.repo.findOneBy({key: config.key})
            if (!exist) {
                const newConfig = this.repo.create(config)
                await this.repo.save(newConfig)
            }
            
        }
        console.log('configuraciones inacializadas')
    }

    async findAll() : Promise<Config[]>{
        return this.repo.find()
    }

    async findByKey(key:string) : Promise <Config | null>{
        return  await this.repo.findOneBy({key});
    }

    async update(key: string, value: string,updatedBy?:string) : Promise<Config | null>{
        const exiting = await this.findByKey(key)
        if (!exiting) return null
        exiting.value = value
        if(updatedBy)  exiting.updatedBy = updatedBy
        return await this.repo.save(exiting)
              
    }
    async getValue(key: string, defaultValue?: string) : Promise <string>{
        const config = await this.findByKey(key)
        return config?.value || defaultValue || '';

    }
}