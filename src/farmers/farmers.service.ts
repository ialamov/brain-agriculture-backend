import { Injectable, BadRequestException, NotFoundException, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Farmer } from '../entities/farmer.entity';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { LoggerService } from '../common/services/logger.service';
import { ValidateCPFAndCNPJ } from '../utils/validate-cpf-cnpj';
import { UpdateFarmerDto } from './dto/update-farmer.dto';
import { Farm } from '../entities/farm.entity';
import { Harvest } from '../entities/harvest.entity';
import { Crop } from '../entities/crop.entity';

@Injectable()
export class FarmersService {
  constructor(
      @InjectRepository(Farmer)
      private farmerRepository: Repository<Farmer>,
      private logger: LoggerService
  ) {}

  async create(createFarmerDto: CreateFarmerDto): Promise<Farmer> {
  try {
          this.logger.log(`Creating farmer: ${createFarmerDto.name}`, 'FarmerService');
  
  if (createFarmerDto.cnpj && createFarmerDto.cpf) {
    this.logger.error('Farmer cannot have both CNPJ and CPF', undefined, 'FarmerService');
    throw new BadRequestException('Farmer cannot have both CNPJ and CPF');
  }

  if (!createFarmerDto.cnpj && !createFarmerDto.cpf ) {
    this.logger.error('Farmer must have either CNPJ or CPF', undefined, 'FarmerService');
    throw new BadRequestException('Farmer must have either CNPJ or CPF');
  }

  if (createFarmerDto.cpf && !ValidateCPFAndCNPJ.validateCPF(createFarmerDto.cpf)) {
    this.logger.error(`Invalid CPF: ${createFarmerDto.cpf}`, undefined, 'FarmerService');
    throw new BadRequestException('Invalid CPF');
  }

  if (createFarmerDto.cnpj && !ValidateCPFAndCNPJ.validateCNPJ(createFarmerDto.cnpj)) {
    this.logger.error(`Invalid CNPJ: ${createFarmerDto.cnpj}`, undefined, 'FarmerService');
    throw new BadRequestException('Invalid CNPJ');
  }

  const farmer = this.farmerRepository.create(createFarmerDto);
  return await this.farmerRepository.save(farmer);
  
      } catch (error) {
          if (error instanceof BadRequestException) {
            throw error;
          }
          this.logger.error('Failed to create farmer', undefined, 'FarmerService');
          throw new HttpException('Failed to create farmer', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  async findAll(page: number, pageSize: number): Promise<Farmer[]> {
    try {
      const skip = (page - 1) * pageSize;
      const take = pageSize;
      return await this.farmerRepository.find({ skip, take });
    } catch (error) {
      this.logger.error(`Error finding all farmers: ${error}`, undefined, 'FarmerService');
      throw new InternalServerErrorException('Error finding all farmers');
    }
  }

  async findOne(id: string): Promise<Farmer> {
    try {
    const farmer = await this.farmerRepository.findOne({ 
      where: { id },
    });
    
    if (!farmer) {
      this.logger.error(`Farmer with ID ${id} not found`, undefined, 'FarmerService');
      throw new NotFoundException(`Farmer with ID ${id} not found`);
    }
    return farmer;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding farmer with ID ${id}: ${error}`, undefined, 'FarmerService');
      throw new InternalServerErrorException('Error finding farmer');
    }
  }

  async update(id: string, updateFarmerDto: UpdateFarmerDto): Promise<Farmer> {
    try {
    const farmer = await this.findOne(id);
    
    Object.assign(farmer, updateFarmerDto);
        
    return this.farmerRepository.save(farmer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating farmer with ID ${id}: ${error}`, undefined, 'FarmerService');
      throw new InternalServerErrorException('Error updating farmer');
    }
  }

  async remove(id: string): Promise<void> {
    try {

      const farmer = await this.findOne(id);
      
      await this.farmerRepository.manager.transaction(async (transactionalEntityManager) => {
        const farms = await transactionalEntityManager.find(Farm, { where: { farmer: { id } } });
        
        for (const farm of farms) {
          const harvests = await transactionalEntityManager.find(Harvest, { where: { farm: { id: farm.id } } });
          
          for (const harvest of harvests) {
            await transactionalEntityManager.delete(Crop, { harvest: { id: harvest.id } });
          }
          
          await transactionalEntityManager.delete(Harvest, { farm: { id: farm.id } });
        }
        
        await transactionalEntityManager.delete(Farm, { farmer: { id } });
        
        const result = await transactionalEntityManager.delete(Farmer, id);
        
        if (result.affected === 0) {
          throw new Error('Farmer deletion failed');
        }
      });
      
      this.logger.log(`Successfully deleted farmer with ID ${id} and all related data`, 'FarmerService');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error deleting farmer with ID ${id}: ${error.message}`, error.stack, 'FarmerService');
      
      if (error.code === '23503') {
        throw new BadRequestException('Cannot delete farmer: there are farms or harvests associated with this farmer');
      } else if (error.code === '42P01') {
        throw new InternalServerErrorException('Database schema error: table not found');
      } else if (error.code === '42703') {
        throw new InternalServerErrorException('Database schema error: column not found');
      } else if (error.code === '23505') {
        throw new BadRequestException('Farmer with this CPF or CNPJ already exists');
      }
      
      if (error.code && error.code.startsWith('23') || error.code && error.code.startsWith('42')) {
        throw new InternalServerErrorException('Database operation failed');
      }
      
      throw new InternalServerErrorException('Error deleting farmer');
    }
  }
}
