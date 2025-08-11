import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Farm } from '../entities/farm.entity';
import { Repository } from 'typeorm';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class FarmsService {
  constructor(
    @InjectRepository(Farm)
    private readonly farmRepository: Repository<Farm>,
		private readonly loggerService: LoggerService,
  ) {}

  async create(createFarmDto: CreateFarmDto): Promise<Farm> {
		try { 
    if (createFarmDto.cultivationArea > createFarmDto.totalArea) {
			this.loggerService.error('Cultivation area cannot be greater than total area');
      throw new HttpException('Cultivation area cannot be greater than total area', HttpStatus.FORBIDDEN);
    }
    if (createFarmDto.vegetationArea > createFarmDto.totalArea) {
			this.loggerService.error('Vegetation area cannot be greater than total area');
      throw new HttpException('Vegetation area cannot be greater than total area', HttpStatus.FORBIDDEN);
    }
    if (createFarmDto.cultivationArea + createFarmDto.vegetationArea > createFarmDto.totalArea) {
			this.loggerService.error('Cultivation and vegetation area cannot be greater than total area');
      throw new HttpException('Cultivation and vegetation area cannot be greater than total area', HttpStatus.FORBIDDEN);
    }

    const farm = this.farmRepository.create(createFarmDto);
    return this.farmRepository.save(farm);
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			this.loggerService.error('Failed to create farm', error);
			throw new HttpException('Failed to create farm', HttpStatus.INTERNAL_SERVER_ERROR);
		}
  }

  async findAll(): Promise<Farm[]> {
    try {
    return this.farmRepository.find({
      relations: ['farmer'],
    });
    } catch (error) {
      this.loggerService.error('Failed to find all farms', error);
      throw new HttpException('Failed to find all farms', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string): Promise<Farm> {
    try {
    const farm = await this.farmRepository.findOne({
      where: { id },
      relations: ['farmer'],
    });
    
    if (!farm) {
      this.loggerService.error(`Farm with ID ${id} not found`);
      throw new NotFoundException(`Farm with ID ${id} not found`);
    }
    
    return farm;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to find farm', error);
      throw new HttpException('Failed to find farm', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, updateFarmDto: UpdateFarmDto): Promise<Farm> {
    try {
    const farm = await this.findOne(id);
    
    Object.assign(farm, updateFarmDto);
    
    if (farm.cultivationArea > farm.totalArea) {
      this.loggerService.error('Cultivation area cannot be greater than total area');
      throw new BadRequestException('Cultivation area cannot be greater than total area');
    }
    if (farm.vegetationArea > farm.totalArea) { 
      this.loggerService.error('Vegetation area cannot be greater than total area');
      throw new BadRequestException('Vegetation area cannot be greater than total area');
    }
    if (farm.cultivationArea + farm.vegetationArea > farm.totalArea) {
      this.loggerService.error('Cultivation and vegetation area cannot be greater than total area');
      throw new BadRequestException('Cultivation and vegetation area cannot be greater than total area');
      }
      
      return this.farmRepository.save(farm);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.loggerService.error('Failed to update farm', error);
      throw new HttpException('Failed to update farm', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string): Promise<void> {
    try {
    const result = await this.farmRepository.delete(id);
    if (result.affected === 0) {
      this.loggerService.error(`Farm with ID ${id} was not found`);
      throw new NotFoundException(`Farm with ID ${id} was not found`);
    }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to remove farm', error);
      throw new HttpException('Failed to remove farm', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
