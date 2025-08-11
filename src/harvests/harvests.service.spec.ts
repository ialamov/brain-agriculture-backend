import { Test, TestingModule } from '@nestjs/testing';
import { HarvestsService } from './harvests.service';
import { Harvest } from '../entities/harvest.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { LoggerService } from '../common/services/logger.service';

const mockHarvestRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  merge: jest.fn(),
});

const mockLoggerService = () => ({
  log: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
});

describe('HarvestsService', () => {
  let service: HarvestsService;
  let harvestRepository: Repository<Harvest>;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HarvestsService,
        {
          provide: getRepositoryToken(Harvest),
          useValue: mockHarvestRepository(),
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService(),
        },
      ],
    }).compile();

    service = module.get<HarvestsService>(HarvestsService);
    harvestRepository = module.get<Repository<Harvest>>(getRepositoryToken(Harvest));
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a harvest successfully', async () => {
      const createHarvestDto: CreateHarvestDto = {
        name: 'Corn Harvest 2024',
        year: 2024,
        farmId: 'farm-id-1',
      };
      const expectedHarvest = {
        id: '1',
        name: 'Corn Harvest 2024',
        year: 2024,
        farm: { id: 'farm-id-1' },
        crops: [],
      } as unknown as Harvest;

      jest.spyOn(harvestRepository, 'create').mockReturnValue(expectedHarvest);
      jest.spyOn(harvestRepository, 'save').mockResolvedValue(expectedHarvest);

      const result = await service.create(createHarvestDto);

      expect(result).toEqual(expectedHarvest);
      expect(harvestRepository.create).toHaveBeenCalledWith(createHarvestDto);
      expect(harvestRepository.save).toHaveBeenCalledWith(expectedHarvest);
    });

    it('should throw HttpException for database error', async () => {
      const createHarvestDto: CreateHarvestDto = {
        name: 'Corn Harvest 2024',
        year: 2024,
        farmId: 'farm-id-1',
      };

      jest.spyOn(harvestRepository, 'create').mockImplementation(() => {
        throw new Error('Database error');
      });
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.create(createHarvestDto)).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to create harvest', expect.any(Error));
    });
  });

  describe('findAll', () => {
    it('should return all harvests', async () => {
      const expectedHarvests = [
        { id: '1', name: 'Corn Harvest 2024', year: 2024, farm: { id: 'farm-id-1' }, crops: [] },
        { id: '2', name: 'Soybean Harvest 2023', year: 2023, farm: { id: 'farm-id-2' }, crops: [] },
      ] as unknown as Harvest[];

      jest.spyOn(harvestRepository, 'find').mockResolvedValue(expectedHarvests);

      const result = await service.findAll();

      expect(result).toEqual(expectedHarvests);
      expect(harvestRepository.find).toHaveBeenCalled();
    });

    it('should throw HttpException for database error', async () => {
      jest.spyOn(harvestRepository, 'find').mockImplementation(() => {
        throw new Error('Database error');
      });
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.findAll()).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to find all harvests', expect.any(Error));
    });
  });

  describe('findOne', () => {
    it('should return a harvest by id with relations', async () => {
      const expectedHarvest = {
        id: '1',
        name: 'Corn Harvest 2024',
        year: 2024,
        farm: { id: 'farm-id-1' },
        crops: [],
      } as unknown as Harvest;

      jest.spyOn(harvestRepository, 'findOne').mockResolvedValue(expectedHarvest);

      const result = await service.findOne('1');

      expect(result).toEqual(expectedHarvest);
      expect(harvestRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['farm'],
      });
    });

    it('should throw NotFoundException when harvest not found', async () => {
      jest.spyOn(harvestRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      expect(loggerService.error).toHaveBeenCalledWith('Harvest with ID 999 not found');
    });

    it('should throw HttpException for database error', async () => {
      jest.spyOn(harvestRepository, 'findOne').mockRejectedValue(new Error('Database error'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.findOne('1')).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to find harvest', expect.any(Error));
    });
  });

  describe('update', () => {
    it('should update a harvest successfully', async () => {
      const updateHarvestDto: UpdateHarvestDto = {
        year: 2025,
      };
      const existingHarvest = {
        id: '1',
        name: 'Corn Harvest 2024',
        year: 2024,
        farm: { id: 'farm-id-1' },
        crops: [],
      } as unknown as Harvest;
      const updatedHarvest = {
        ...existingHarvest,
        year: 2025,
      } as unknown as Harvest;

      jest.spyOn(service, 'findOne').mockResolvedValue(existingHarvest);
      jest.spyOn(harvestRepository, 'merge').mockImplementation((harvest, dto) => {
        Object.assign(harvest, dto);
        return harvest;
      });
      jest.spyOn(harvestRepository, 'save').mockResolvedValue(updatedHarvest);

      const result = await service.update('1', updateHarvestDto);

      expect(result).toEqual(updatedHarvest);
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(harvestRepository.merge).toHaveBeenCalledWith(existingHarvest, updateHarvestDto);
      expect(harvestRepository.save).toHaveBeenCalledWith(updatedHarvest);
    });

    it('should throw NotFoundException when harvest not found during update', async () => {
      const updateHarvestDto: UpdateHarvestDto = {
        year: 2025,
      };

      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Harvest with ID 1 not found'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.update('1', updateHarvestDto)).rejects.toThrow(NotFoundException);
      // The service should not call logger.error when NotFoundException is thrown from findOne
      expect(loggerService.error).not.toHaveBeenCalled();
    });

    it('should throw HttpException for database error during update', async () => {
      const updateHarvestDto: UpdateHarvestDto = {
        year: 2025,
      };

      jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Database error'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.update('1', updateHarvestDto)).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to update harvest', expect.any(Error));
    });
  });

  describe('remove', () => {
    it('should remove a harvest successfully', async () => {
      jest.spyOn(harvestRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await service.remove('1');

      expect(harvestRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when harvest not found', async () => {
      jest.spyOn(harvestRepository, 'delete').mockResolvedValue({ affected: 0 } as any);
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      expect(loggerService.error).toHaveBeenCalledWith('Harvest with ID 999 was not found');
    });

    it('should throw HttpException for database error', async () => {
      jest.spyOn(harvestRepository, 'delete').mockRejectedValue(new Error('Database error'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.remove('1')).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to remove harvest', expect.any(Error));
    });
  });
});
