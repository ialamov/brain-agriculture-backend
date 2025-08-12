import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Farmer } from '../entities/farmer.entity';
import { Farm } from '../entities/farm.entity';
import { Repository } from 'typeorm';
import { Harvest } from '../entities/harvest.entity';
import { Crop } from '../entities/crop.entity';
import { LoggerService } from '../common/services/logger.service';

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
    private loggerService: LoggerService,
	) {}

	async getMetricsSummary(): Promise<any> {
		try { 
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
		} catch (error) {
			this.loggerService.error('Failed to get metrics summary', error);
			throw new HttpException('Failed to get metrics summary', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

  async getUniqueYearsAndCrops(): Promise<any> {
    try {
      const years = await this.harvestRepository.query('SELECT DISTINCT "year" FROM "harvests"');
      const crops = await this.cropRepository.query('SELECT DISTINCT "name" FROM "crops"');
      return { years, crops };
    } catch (error) {
      this.loggerService.error('Failed to get unique years and crops', error);
      throw new HttpException('Failed to get unique years and crops', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getTotalAreaRegistered(): Promise<any> {
    try {
      const totalArea = await this.farmRepository.query('SELECT SUM("totalArea") FROM "farms"');
      console.log('totalArea', totalArea);
      if (totalArea.length === 0) {
        this.loggerService.error('There is no area registered');
        throw new HttpException('There is no area registered', HttpStatus.NOT_FOUND);
      }
      return totalArea[0].sum;
    } catch (error) {
      this.loggerService.error('Failed to get total area registered', error);
      throw new HttpException('Failed to get total area registered', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
