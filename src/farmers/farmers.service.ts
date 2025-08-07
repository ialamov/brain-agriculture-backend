import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Farmer } from '../entities/farmer.entity';
import { Repository } from 'typeorm';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { LoggerService } from '../common/services/logger.service';
import { ValidateCPFAndCNPJ } from '../utils/validate-cpf-cnpj';

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
    const savedFarmer = await this.farmerRepository.save(farmer);
    
    this.logger.log(`Farmer created successfully: ${savedFarmer.id}`, 'FarmerService');
    return savedFarmer;
        } catch (error) {
            throw new HttpException('Failed to create farmer', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
