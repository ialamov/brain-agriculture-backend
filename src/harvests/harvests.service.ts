import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Harvest } from '../entities/harvest.entity';
import { Repository } from 'typeorm';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class HarvestsService {
  constructor(
    @InjectRepository(Harvest)
    private readonly harvestRepository: Repository<Harvest>,
    private readonly loggerService: LoggerService
  ) {}

  async create(createHarvestDto: CreateHarvestDto): Promise<Harvest> {
    try {
      const harvest = this.harvestRepository.create(createHarvestDto);
      return this.harvestRepository.save(harvest);
    } catch (error) {
      this.loggerService.error('Failed to create harvest', error);
      throw new HttpException('Failed to create harvest', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<Harvest[]> {
    try {
      return this.harvestRepository.find();
    } catch (error) {
      this.loggerService.error('Failed to find all harvests', error);
      throw new HttpException('Failed to find all harvests', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string): Promise<Harvest> {
    try {
    const harvest = await this.harvestRepository.findOne({
      where: { id },
      relations: ['farm'],
    });
    if (!harvest) {
      this.loggerService.error(`Harvest with ID ${id} not found`);
      throw new NotFoundException(`Harvest with ID ${id} not found`);
    }
    return harvest;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to find harvest', error);
      throw new HttpException('Failed to find harvest', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, updateHarvestDto: UpdateHarvestDto): Promise<Harvest> {
    try {
      const harvest = await this.findOne(id);
      this.harvestRepository.merge(harvest, updateHarvestDto);
      return this.harvestRepository.save(harvest);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to update harvest', error);
      throw new HttpException('Failed to update harvest', HttpStatus.INTERNAL_SERVER_ERROR);
    } 
  }

  async remove(id: string): Promise<void> {
    try {   
      const result = await this.harvestRepository.delete(id);
      if (result.affected === 0) {
        this.loggerService.error(`Harvest with ID ${id} was not found`);
        throw new NotFoundException(`Harvest with ID ${id} was not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to remove harvest', error);
      throw new HttpException('Failed to remove harvest', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
