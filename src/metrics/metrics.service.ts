import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Farmer } from '../entities/farmer.entity';
import { Farm } from '../entities/farm.entity';
import { Repository } from 'typeorm';
import { Harvest } from '../entities/harvest.entity';
import { Crop } from '../entities/crop.entity';

@Injectable()
export class MetricsService {
	constructor(
			@InjectRepository(Farmer)
			private farmerRepository: Repository<Farmer>,
			@InjectRepository(Farm)
			private farmRepository: Repository<Farm>,
			@InjectRepository(Harvest)
			private harvestRepository: Repository<Harvest>,
			@InjectRepository(Crop)
			private cropRepository: Repository<Crop>,
	) {}

	async getMetricsSummary(): Promise<any> {
		const list = [
				this.farmerRepository, 
				this.farmRepository, 
				this.harvestRepository, 
				this.cropRepository
		];
		
		const results = await Promise.all(list.map(async (item: Repository<any>) => {
			return {[item.metadata.tableName]: await item.count()} ;
		})).then((res) => {
			return res.reduce((acc, obj) => Object.assign(acc, obj), {});
		});

		return results
	}
}
