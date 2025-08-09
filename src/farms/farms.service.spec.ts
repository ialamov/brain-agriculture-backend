import { Test, TestingModule } from '@nestjs/testing';
import { FarmsService } from './farms.service';
import { Farm } from '../entities/farm.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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
      jest.spyOn(loggerService, 'error').mockImplementation();

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
        cultivationArea: 60.0, // Greater than total area
        vegetationArea: 10.0,
        farmerId: 'farmer-id-1',
      };

      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.create(createFarmDto)).rejects.toThrow('Failed to create farm');
      expect(loggerService.error).toHaveBeenCalledWith('Cultivation area cannot be greater than total area');
      expect(farmRepository.create).not.toHaveBeenCalled();
    });

    it('should throw HttpException when vegetation area is greater than total area', async () => {
      const createFarmDto: CreateFarmDto = {
        name: 'Invalid Farm',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 50.0,
        cultivationArea: 30.0,
        vegetationArea: 60.0, // Greater than total area
        farmerId: 'farmer-id-1',
      };

      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.create(createFarmDto)).rejects.toThrow('Failed to create farm');
      expect(loggerService.error).toHaveBeenCalledWith('Vegetation area cannot be greater than total area');
      expect(farmRepository.create).not.toHaveBeenCalled();
    });

    it('should throw HttpException when cultivation and vegetation area sum is greater than total area', async () => {
      const createFarmDto: CreateFarmDto = {
        name: 'Invalid Farm',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 50.0,
        cultivationArea: 30.0,
        vegetationArea: 25.0, // 30 + 25 = 55 > 50
        farmerId: 'farmer-id-1',
      };

      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.create(createFarmDto)).rejects.toThrow('Failed to create farm');
      expect(loggerService.error).toHaveBeenCalledWith('Cultivation and vegetation area cannot be greater than total area');
      expect(farmRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all farms with farmer relations', async () => {
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
        {
          id: '2',
          name: 'Fazenda Santa Maria',
          city: 'Rio de Janeiro',
          state: 'RJ',
          totalArea: 200.0,
          cultivationArea: 150.0,
          vegetationArea: 50.0,
          farmer: { id: 'farmer-id-2' },
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
      jest.spyOn(farmRepository, 'find').mockRejectedValue(new Error('Database error'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return a farm by id with farmer relations', async () => {
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

    it('should throw HttpException when farm not found', async () => {
      jest.spyOn(farmRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.findOne('999')).rejects.toThrow('Failed to find farm');
      expect(loggerService.error).toHaveBeenCalledWith('Farm with ID 999 not found');
    });

    it('should throw HttpException for database error', async () => {
      jest.spyOn(farmRepository, 'findOne').mockRejectedValue(new Error('Database error'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.findOne('1')).rejects.toThrow('Failed to find farm');
      expect(loggerService.error).toHaveBeenCalledWith('Failed to find farm', expect.any(Error));
    });
  });

  describe('update', () => {
    it('should update a farm successfully', async () => {
      const updateFarmDto: UpdateFarmDto = {
        name: 'Fazenda São João Atualizada',
        cultivationArea: 85.0,
      };
      const existingFarm = {
        id: '1',
        name: 'Fazenda São João',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 100.5,
        cultivationArea: 80.0,
        vegetationArea: 15.5, // 85.0 + 15.5 = 100.5 (total area)
        farmer: { id: 'farmer-id-1' },
        harvests: [],
      } as unknown as Farm;
      const updatedFarm = {
        ...existingFarm,
        name: 'Fazenda São João Atualizada',
        cultivationArea: 85.0,
      } as unknown as Farm;

      jest.spyOn(service, 'findOne').mockResolvedValue(existingFarm);
      jest.spyOn(farmRepository, 'save').mockResolvedValue(updatedFarm);

      const result = await service.update('1', updateFarmDto);

      expect(result).toEqual(updatedFarm);
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(farmRepository.save).toHaveBeenCalledWith(updatedFarm);
    });

    it('should throw HttpException when updated cultivation area is greater than total area', async () => {
      const updateFarmDto: UpdateFarmDto = {
        cultivationArea: 120.0, // Greater than total area
      };
      const existingFarm = {
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

      jest.spyOn(service, 'findOne').mockResolvedValue(existingFarm);
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.update('1', updateFarmDto)).rejects.toThrow('Failed to update farm');
      expect(loggerService.error).toHaveBeenCalledWith('Cultivation area cannot be greater than total area');
      expect(farmRepository.save).not.toHaveBeenCalled();
    });

    it('should throw HttpException when updated vegetation area is greater than total area', async () => {
      const updateFarmDto: UpdateFarmDto = {
        vegetationArea: 120.0, // Greater than total area
      };
      const existingFarm = {
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

      jest.spyOn(service, 'findOne').mockResolvedValue(existingFarm);
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.update('1', updateFarmDto)).rejects.toThrow('Failed to update farm');
      expect(loggerService.error).toHaveBeenCalledWith('Vegetation area cannot be greater than total area');
      expect(farmRepository.save).not.toHaveBeenCalled();
    });

    it('should throw HttpException when updated cultivation and vegetation area sum is greater than total area', async () => {
      const updateFarmDto: UpdateFarmDto = {
        cultivationArea: 60.0,
        vegetationArea: 50.0, // 60 + 50 = 110 > 100.5
      };
      const existingFarm = {
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

      jest.spyOn(service, 'findOne').mockResolvedValue(existingFarm);
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.update('1', updateFarmDto)).rejects.toThrow('Failed to update farm');
      expect(loggerService.error).toHaveBeenCalledWith('Cultivation and vegetation area cannot be greater than total area');
      expect(farmRepository.save).not.toHaveBeenCalled();
    });

    it('should throw HttpException for database error', async () => {
      const updateFarmDto: UpdateFarmDto = {
        name: 'Updated Farm',
      };

      jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Database error'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.update('1', updateFarmDto)).rejects.toThrow('Failed to update farm');
      expect(loggerService.error).toHaveBeenCalledWith('Failed to update farm', expect.any(Error));
    });
  });

  describe('remove', () => {
    it('should remove a farm successfully', async () => {
      jest.spyOn(farmRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await service.remove('1');

      expect(farmRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw HttpException when farm not found', async () => {
      jest.spyOn(farmRepository, 'delete').mockResolvedValue({ affected: 0 } as any);
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.remove('999')).rejects.toThrow('Failed to remove farm');
      expect(loggerService.error).toHaveBeenCalledWith('Farm with ID 999 was not found');
    });

    it('should throw HttpException for database error', async () => {
      jest.spyOn(farmRepository, 'delete').mockRejectedValue(new Error('Database error'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.remove('1')).rejects.toThrow('Failed to remove farm');
      expect(loggerService.error).toHaveBeenCalledWith('Failed to remove farm', expect.any(Error));
    });
  });
});
