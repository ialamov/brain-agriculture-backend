import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Farmer } from '../entities/farmer.entity';
import { Repository } from 'typeorm';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { LoggerService } from '../common/services/logger.service';
import { ValidateCPFAndCNPJ } from '../utils/validate-cpf-cnpj';
import { UpdateFarmerDto } from './dto/update-farmer.dto';

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
          this.logger.error('Failed to create farmer', undefined, 'FarmerService');
          throw new HttpException('Failed to create farmer', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  async findAll(): Promise<Farmer[]> {
    try {
      return await this.farmerRepository.find();
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
      this.logger.error(`Error updating farmer with ID ${id}: ${error}`, undefined, 'FarmerService');
      throw new InternalServerErrorException('Error updating farmer');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.farmerRepository.delete(id);
      if (result.affected === 0) {
        this.logger.error(`Farmer with ID ${id} was not found`, undefined, 'FarmerService');
        throw new NotFoundException(`Farmer with ID ${id} was not found`);
      }
    } catch (error) {
      this.logger.error(`Error deleting farmer with ID ${id}: ${error}`, undefined, 'FarmerService');
      throw new InternalServerErrorException('Error deleting farmer');
    }
  }
}
