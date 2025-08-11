import { Test, TestingModule } from '@nestjs/testing';
import { FarmersService } from './farmers.service';
import { Farmer } from '../entities/farmer.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoggerService } from '../common/services/logger.service';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';
import { BadRequestException, HttpException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Farm } from '../entities/farm.entity';
import { Harvest } from '../entities/harvest.entity';
import { Crop } from '../entities/crop.entity';

jest.mock('../utils/validate-cpf-cnpj', () => ({
  ValidateCPFAndCNPJ: {
    validateCPF: jest.fn(),
    validateCNPJ: jest.fn(),
  },
}));

const mockFarmerRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  manager: {
    transaction: jest.fn(),
  },
});

const mockLoggerService = () => ({
  log: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
});

describe('FarmersService', () => {
  let service: FarmersService;
  let farmerRepository: Repository<Farmer>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmersService,
        {
          provide: getRepositoryToken(Farmer),
          useValue: mockFarmerRepository(),
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService(),
        },
      ],
    }).compile();

    service = module.get<FarmersService>(FarmersService);
    farmerRepository = module.get<Repository<Farmer>>(getRepositoryToken(Farmer));
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a farmer with CPF successfully', async () => {
      const createFarmerDto: CreateFarmerDto = {
        name: 'João Silva',
        cpf: '123.456.789-00',
        cnpj: undefined,
      };
      const expectedFarmer = {
        id: '1',
        name: 'João Silva',
        cpf: '123.456.789-00',
        cnpj: null,
        farm: [],
      } as unknown as Farmer;

      const { ValidateCPFAndCNPJ } = require('../utils/validate-cpf-cnpj');
      ValidateCPFAndCNPJ.validateCPF.mockReturnValue(true);

      jest.spyOn(farmerRepository, 'create').mockReturnValue(expectedFarmer);
      jest.spyOn(farmerRepository, 'save').mockResolvedValue(expectedFarmer);
      jest.spyOn(logger, 'log').mockImplementation();

      const result = await service.create(createFarmerDto);

      expect(result).toEqual(expectedFarmer);
      expect(farmerRepository.create).toHaveBeenCalledWith(createFarmerDto);
      expect(farmerRepository.save).toHaveBeenCalledWith(expectedFarmer);
      expect(logger.log).toHaveBeenCalledWith('Creating farmer: João Silva', 'FarmerService');
    });

    it('should create a farmer with CNPJ successfully', async () => {
      const createFarmerDto: CreateFarmerDto = {
        name: 'Empresa ABC Ltda',
        cnpj: '12.345.678/0001-90',
        cpf: undefined,
      };
      const expectedFarmer = {
        id: '2',
        name: 'Empresa ABC Ltda',
        cpf: null,
        cnpj: '12.345.678/0001-90',
        farm: [],
      } as unknown as Farmer;

      const { ValidateCPFAndCNPJ } = require('../utils/validate-cpf-cnpj');
      ValidateCPFAndCNPJ.validateCNPJ.mockReturnValue(true);

      jest.spyOn(farmerRepository, 'create').mockReturnValue(expectedFarmer);
      jest.spyOn(farmerRepository, 'save').mockResolvedValue(expectedFarmer);
      jest.spyOn(logger, 'log').mockImplementation();

      const result = await service.create(createFarmerDto);

      expect(result).toEqual(expectedFarmer);
      expect(farmerRepository.create).toHaveBeenCalledWith(createFarmerDto);
      expect(farmerRepository.save).toHaveBeenCalledWith(expectedFarmer);
    });

    it('should throw BadRequestException when farmer has both CPF and CNPJ', async () => {
      const createFarmerDto: CreateFarmerDto = {
        name: 'Invalid Farmer',
        cpf: '123.456.789-00',
        cnpj: '12.345.678/0001-90',
      };

      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.create(createFarmerDto)).rejects.toThrow(BadRequestException);
      expect(logger.error).toHaveBeenCalledWith('Farmer cannot have both CNPJ and CPF', undefined, 'FarmerService');
    });

    it('should throw BadRequestException when farmer has neither CPF nor CNPJ', async () => {
      const createFarmerDto: CreateFarmerDto = {
        name: 'Invalid Farmer',
        cpf: undefined,
        cnpj: undefined,
      };

      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.create(createFarmerDto)).rejects.toThrow(BadRequestException);
      expect(logger.error).toHaveBeenCalledWith('Farmer must have either CNPJ or CPF', undefined, 'FarmerService');
    });

    it('should throw BadRequestException for invalid CPF', async () => {
      const createFarmerDto: CreateFarmerDto = {
        name: 'Invalid Farmer',
        cpf: '123.456.789-99',
        cnpj: undefined,
      };

      const { ValidateCPFAndCNPJ } = require('../utils/validate-cpf-cnpj');
      ValidateCPFAndCNPJ.validateCPF.mockReturnValue(false);

      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.create(createFarmerDto)).rejects.toThrow(BadRequestException);
      expect(logger.error).toHaveBeenCalledWith('Invalid CPF: 123.456.789-99', undefined, 'FarmerService');
    });

    it('should throw BadRequestException for invalid CNPJ', async () => {
      const createFarmerDto: CreateFarmerDto = {
        name: 'Invalid Company',
        cpf: undefined,
        cnpj: '12.345.678/0001-99',
      };

      const { ValidateCPFAndCNPJ } = require('../utils/validate-cpf-cnpj');
      ValidateCPFAndCNPJ.validateCNPJ.mockReturnValue(false);

      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.create(createFarmerDto)).rejects.toThrow(BadRequestException);
      expect(logger.error).toHaveBeenCalledWith('Invalid CNPJ: 12.345.678/0001-99', undefined, 'FarmerService');
    });

    it('should throw HttpException for database error', async () => {
      const createFarmerDto: CreateFarmerDto = {
        name: 'Test Farmer',
        cpf: '123.456.789-00',
        cnpj: undefined,
      };

      const { ValidateCPFAndCNPJ } = require('../utils/validate-cpf-cnpj');
      ValidateCPFAndCNPJ.validateCPF.mockReturnValue(true);

      jest.spyOn(farmerRepository, 'create').mockImplementation(() => {
        throw new Error('Database error');
      });
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.create(createFarmerDto)).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalledWith('Failed to create farmer', undefined, 'FarmerService');
    });
  });

  describe('findAll', () => {
    it('should return all farmers with pagination', async () => {
      const expectedFarmers = [
        { id: '1', name: 'Farmer 1', cpf: '123.456.789-00', cnpj: null, farm: [] },
        { id: '2', name: 'Farmer 2', cpf: null, cnpj: '12.345.678/0001-90', farm: [] },
      ] as unknown as Farmer[];

      jest.spyOn(farmerRepository, 'find').mockResolvedValue(expectedFarmers);

      const result = await service.findAll(1, 10);

      expect(result).toEqual(expectedFarmers);
      expect(farmerRepository.find).toHaveBeenCalledWith({ skip: 0, take: 10 });
    });

    it('should throw InternalServerErrorException for database error', async () => {
      jest.spyOn(farmerRepository, 'find').mockRejectedValue(new Error('Database error'));
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.findAll(1, 10)).rejects.toThrow(InternalServerErrorException);
      expect(logger.error).toHaveBeenCalledWith('Error finding all farmers: Error: Database error', undefined, 'FarmerService');
    });
  });

  describe('findOne', () => {
    it('should return a farmer by id', async () => {
      const expectedFarmer = {
        id: '1',
        name: 'João Silva',
        cpf: '123.456.789-00',
        cnpj: null,
        farm: [],
      } as unknown as Farmer;

      jest.spyOn(farmerRepository, 'findOne').mockResolvedValue(expectedFarmer);

      const result = await service.findOne('1');

      expect(result).toEqual(expectedFarmer);
      expect(farmerRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException when farmer not found', async () => {
      jest.spyOn(farmerRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      expect(logger.error).toHaveBeenCalledWith('Farmer with ID 999 not found', undefined, 'FarmerService');
    });

    it('should throw InternalServerErrorException for database error', async () => {
      jest.spyOn(farmerRepository, 'findOne').mockRejectedValue(new Error('Database error'));
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.findOne('1')).rejects.toThrow(InternalServerErrorException);
      expect(logger.error).toHaveBeenCalledWith('Error finding farmer with ID 1: Error: Database error', undefined, 'FarmerService');
    });
  });

  describe('update', () => {
    it('should update a farmer successfully', async () => {
      const updateFarmerDto: UpdateFarmerDto = {
        name: 'Updated Name',
      };
      const existingFarmer = {
        id: '1',
        name: 'Original Name',
        cpf: '123.456.789-00',
        cnpj: null,
        farm: [],
      } as unknown as Farmer;
      const updatedFarmer = {
        ...existingFarmer,
        name: 'Updated Name',
      } as unknown as Farmer;

      jest.spyOn(service, 'findOne').mockResolvedValue(existingFarmer);
      jest.spyOn(farmerRepository, 'save').mockResolvedValue(updatedFarmer);

      const result = await service.update('1', updateFarmerDto);

      expect(result).toEqual(updatedFarmer);
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(farmerRepository.save).toHaveBeenCalledWith(updatedFarmer);
    });

    it('should throw NotFoundException when farmer not found during update', async () => {
      const updateFarmerDto: UpdateFarmerDto = {
        name: 'Updated Name',
      };

      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Farmer with ID 1 not found'));
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.update('1', updateFarmerDto)).rejects.toThrow(NotFoundException);
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException for database error', async () => {
      const updateFarmerDto: UpdateFarmerDto = {
        name: 'Updated Name',
      };

      jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Database error'));
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.update('1', updateFarmerDto)).rejects.toThrow(InternalServerErrorException);
      expect(logger.error).toHaveBeenCalledWith('Error updating farmer with ID 1: Error: Database error', undefined, 'FarmerService');
    });
  });

  describe('remove', () => {
    it('should remove a farmer successfully with cascade deletion', async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockManager = {
          find: jest.fn().mockResolvedValue([]),
          delete: jest.fn().mockResolvedValue({ affected: 1 }),
        };
        
        await callback(mockManager);
      });

      jest.spyOn(farmerRepository.manager, 'transaction').mockImplementation(mockTransaction);
      jest.spyOn(service, 'findOne').mockResolvedValue({} as Farmer);
      jest.spyOn(logger, 'log').mockImplementation();

      await service.remove('1');

      expect(farmerRepository.manager.transaction).toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith('Successfully deleted farmer with ID 1 and all related data', 'FarmerService');
    });

    it('should throw NotFoundException when farmer not found during removal', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Farmer with ID 999 not found'));
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException for database error', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Database error'));
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.remove('1')).rejects.toThrow(InternalServerErrorException);
      expect(logger.error).toHaveBeenCalledWith('Error deleting farmer with ID 1: Database error', expect.any(String), 'FarmerService');
    });

    it('should handle foreign key constraint violation', async () => {
      const dbError = new Error('Foreign key constraint violation');
      (dbError as any).code = '23503';

      jest.spyOn(service, 'findOne').mockResolvedValue({} as Farmer);
      jest.spyOn(farmerRepository.manager, 'transaction').mockRejectedValue(dbError);
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
      expect(logger.error).toHaveBeenCalledWith('Error deleting farmer with ID 1: Foreign key constraint violation', expect.any(String), 'FarmerService');
    });
  });
});
