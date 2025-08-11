import { Test, TestingModule } from '@nestjs/testing';
import { FarmsService } from './farms.service';
import { Farm } from '../entities/farm.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { BadRequestException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from '../common/services/logger.service';

const mockFarmRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

const mockLoggerService = () => ({
  log: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
});

describe('FarmsService', () => {
  let service: FarmsService;
  let farmRepository: Repository<Farm>;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmsService,
        {
          provide: getRepositoryToken(Farm),
          useValue: mockFarmRepository(),
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService(),
        },
      ],
    }).compile();

    service = module.get<FarmsService>(FarmsService);
    farmRepository = module.get<Repository<Farm>>(getRepositoryToken(Farm));
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a farm successfully', async () => {
      const createFarmDto: CreateFarmDto = {
        name: 'Fazenda São João',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 100.5,
        cultivationArea: 80.0,
        vegetationArea: 20.5,
        farmerId: 'farmer-id-1',
      };
      const expectedFarm = {
        id: '1',
        name: 'Fazenda São João',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 100.5,
        cultivationArea: 80.0,
        vegetationArea: 20.5,
        farmer: { id: 'farmer-id-1' },
        harvests: [],
      } as unknown as Farm;

      jest.spyOn(farmRepository, 'create').mockReturnValue(expectedFarm);
      jest.spyOn(farmRepository, 'save').mockResolvedValue(expectedFarm);

      const result = await service.create(createFarmDto);

      expect(result).toEqual(expectedFarm);
      expect(farmRepository.create).toHaveBeenCalledWith(createFarmDto);
      expect(farmRepository.save).toHaveBeenCalledWith(expectedFarm);
    });

    it('should throw HttpException when cultivation area is greater than total area', async () => {
      const createFarmDto: CreateFarmDto = {
        name: 'Invalid Farm',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 50.0,
        cultivationArea: 60.0,
        vegetationArea: 10.0,
        farmerId: 'farmer-id-1',
      };

      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.create(createFarmDto)).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Cultivation area cannot be greater than total area');
    });

    it('should throw HttpException when vegetation area is greater than total area', async () => {
      const createFarmDto: CreateFarmDto = {
        name: 'Invalid Farm',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 50.0,
        cultivationArea: 30.0,
        vegetationArea: 60.0,
        farmerId: 'farmer-id-1',
      };

      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.create(createFarmDto)).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Vegetation area cannot be greater than total area');
    });

    it('should throw HttpException when combined areas exceed total area', async () => {
      const createFarmDto: CreateFarmDto = {
        name: 'Invalid Farm',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 100.0,
        cultivationArea: 60.0,
        vegetationArea: 50.0, 
        farmerId: 'farmer-id-1',
      };

      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.create(createFarmDto)).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Cultivation and vegetation area cannot be greater than total area');
    });

    it('should throw HttpException for database error', async () => {
      const createFarmDto: CreateFarmDto = {
        name: 'Test Farm',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 100.0,
        cultivationArea: 60.0,
        vegetationArea: 30.0,
        farmerId: 'farmer-id-1',
      };

      jest.spyOn(farmRepository, 'create').mockImplementation(() => {
        throw new Error('Database error');
      });
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.create(createFarmDto)).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to create farm', expect.any(Error));
    });
  });

  describe('findAll', () => {
    it('should return all farms with relations', async () => {
      const expectedFarms = [
        {
          id: '1',
          name: 'Fazenda São João',
          city: 'São Paulo',
          state: 'SP',
          totalArea: 100.5,
          cultivationArea: 80.0,
          vegetationArea: 20.5,
          farmer: { id: 'farmer-id-1' },
          harvests: [],
        },
      ] as unknown as Farm[];

      jest.spyOn(farmRepository, 'find').mockResolvedValue(expectedFarms);

      const result = await service.findAll();

      expect(result).toEqual(expectedFarms);
      expect(farmRepository.find).toHaveBeenCalledWith({
        relations: ['farmer'],
      });
    });

    it('should throw HttpException for database error', async () => {
      jest.spyOn(farmRepository, 'find').mockImplementation(() => {
        throw new Error('Database error');
      });
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.findAll()).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to find all farms', expect.any(Error));
    });
  });

  describe('findOne', () => {
    it('should return a farm by id with relations', async () => {
      const expectedFarm = {
        id: '1',
        name: 'Fazenda São João',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 100.5,
        cultivationArea: 80.0,
        vegetationArea: 20.5,
        farmer: { id: 'farmer-id-1' },
        harvests: [],
      } as unknown as Farm;

      jest.spyOn(farmRepository, 'findOne').mockResolvedValue(expectedFarm);

      const result = await service.findOne('1');

      expect(result).toEqual(expectedFarm);
      expect(farmRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['farmer'],
      });
    });

    it('should throw NotFoundException when farm not found', async () => {
      jest.spyOn(farmRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      expect(loggerService.error).toHaveBeenCalledWith('Farm with ID 999 not found');
    });

    it('should throw HttpException for database error', async () => {
      jest.spyOn(farmRepository, 'findOne').mockRejectedValue(new Error('Database error'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.findOne('1')).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to find farm', expect.any(Error));
    });
  });

  describe('update', () => {
    it('should update a farm successfully', async () => {
      const updateFarmDto: UpdateFarmDto = {
        name: 'Updated Farm Name',
        totalArea: 120.0,
        cultivationArea: 90.0,
        vegetationArea: 25.0,
      };

      const existingFarm = {
        id: '1',
        name: 'Original Farm Name',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 100.0,
        cultivationArea: 70.0,
        vegetationArea: 20.0,
        farmer: { id: 'farmer-id-1' },
        harvests: [],
      } as unknown as Farm;

      const updatedFarm = {
        ...existingFarm,
        ...updateFarmDto,
      } as unknown as Farm;

      jest.spyOn(service, 'findOne').mockResolvedValue(existingFarm);
      jest.spyOn(farmRepository, 'save').mockResolvedValue(updatedFarm);

      const result = await service.update('1', updateFarmDto);

      expect(result).toEqual(updatedFarm);
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(farmRepository.save).toHaveBeenCalledWith(updatedFarm);
    });

    it('should throw BadRequestException when cultivation area exceeds total area after update', async () => {
      const updateFarmDto: UpdateFarmDto = {
        cultivationArea: 120.0, 
      };

      const existingFarm = {
        id: '1',
        name: 'Test Farm',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 100.0,
        cultivationArea: 70.0,
        vegetationArea: 20.0,
        farmer: { id: 'farmer-id-1' },
        harvests: [],
      } as unknown as Farm;

      jest.spyOn(service, 'findOne').mockResolvedValue(existingFarm);
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.update('1', updateFarmDto)).rejects.toThrow(BadRequestException);
      expect(loggerService.error).toHaveBeenCalledWith('Cultivation area cannot be greater than total area');
    });

    it('should throw BadRequestException when vegetation area exceeds total area after update', async () => {
      const updateFarmDto: UpdateFarmDto = {
        vegetationArea: 120.0, 
      };

      const existingFarm = {
        id: '1',
        name: 'Test Farm',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 100.0,
        cultivationArea: 70.0,
        vegetationArea: 20.0,
        farmer: { id: 'farmer-id-1' },
        harvests: [],
      } as unknown as Farm;

      jest.spyOn(service, 'findOne').mockResolvedValue(existingFarm);
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.update('1', updateFarmDto)).rejects.toThrow(BadRequestException);
      expect(loggerService.error).toHaveBeenCalledWith('Vegetation area cannot be greater than total area');
    });

    it('should throw BadRequestException when combined areas exceed total area after update', async () => {
      const updateFarmDto: UpdateFarmDto = {
        cultivationArea: 80.0,
        vegetationArea: 30.0, 
      };

      const existingFarm = {
        id: '1',
        name: 'Test Farm',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 100.0,
        cultivationArea: 70.0,
        vegetationArea: 20.0,
        farmer: { id: 'farmer-id-1' },
        harvests: [],
      } as unknown as Farm;

      jest.spyOn(service, 'findOne').mockResolvedValue(existingFarm);
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.update('1', updateFarmDto)).rejects.toThrow(BadRequestException);
      expect(loggerService.error).toHaveBeenCalledWith('Cultivation and vegetation area cannot be greater than total area');
    });

    it('should throw NotFoundException when farm not found during update', async () => {
      const updateFarmDto: UpdateFarmDto = {
        name: 'Updated Name',
      };

      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Farm with ID 1 not found'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.update('1', updateFarmDto)).rejects.toThrow(NotFoundException);
      expect(loggerService.error).not.toHaveBeenCalled();
    });

    it('should throw HttpException for database error during update', async () => {
      const updateFarmDto: UpdateFarmDto = {
        name: 'Updated Name',
      };

      jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Database error'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.update('1', updateFarmDto)).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to update farm', expect.any(Error));
    });
  });

  describe('remove', () => {
    it('should remove a farm successfully', async () => {
      jest.spyOn(farmRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await service.remove('1');

      expect(farmRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when farm not found', async () => {
      jest.spyOn(farmRepository, 'delete').mockResolvedValue({ affected: 0 } as any);
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      expect(loggerService.error).toHaveBeenCalledWith('Farm with ID 999 was not found');
    });

    it('should throw HttpException for database error', async () => {
      jest.spyOn(farmRepository, 'delete').mockRejectedValue(new Error('Database error'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.remove('1')).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to remove farm', expect.any(Error));
    });
  });
});
