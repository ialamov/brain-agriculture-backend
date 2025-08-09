import { Test, TestingModule } from '@nestjs/testing';
import { CropsService } from './crops.service';
import { Crop } from '../entities/crop.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoggerService } from '../common/services/logger.service';
import { HttpException, NotFoundException } from '@nestjs/common';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';

const mockCropRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
});

const mockLoggerService = () => ({
  log: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
});

const mockCrops = [
  { id: '1', name: 'Milho', harvest: { id: 'harvest-1' } },
  { id: '2', name: 'Soja', harvest: { id: 'harvest-2' } },
] as Crop[];

const mockCrop = { id: '1', name: 'Milho', harvest: { id: 'harvest-1' } } as Crop;

describe('CropsService', () => {
  let service: CropsService;
  let cropRepository: Repository<Crop>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CropsService,
        {
          provide: getRepositoryToken(Crop),
          useValue: mockCropRepository(),
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService(),
        },
      ],
    }).compile();

    service = module.get<CropsService>(CropsService);
    cropRepository = module.get<Repository<Crop>>(getRepositoryToken(Crop));
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new crop successfully', async () => {
      const createCropDto: CreateCropDto = {
        name: 'Milho',
        harvestId: 'harvest-1',
      };

      jest.spyOn(cropRepository, 'create').mockReturnValue(mockCrop);
      jest.spyOn(cropRepository, 'save').mockResolvedValue(mockCrop);
      jest.spyOn(logger, 'error').mockImplementation();

      const result = await service.create(createCropDto);

      expect(result).toEqual(mockCrop);
      expect(cropRepository.create).toHaveBeenCalledWith(createCropDto);
      expect(cropRepository.save).toHaveBeenCalledWith(mockCrop);
    });

    it('should throw HttpException when creation fails', async () => {
      const createCropDto: CreateCropDto = {
        name: 'Milho',
        harvestId: 'harvest-1',
      };

      jest.spyOn(cropRepository, 'create').mockImplementation(() => {
        throw new Error('Database error');
      });
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.create(createCropDto)).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalledWith('Failed to create crop', expect.any(Error));
    });
  });

  describe('findAll', () => {
    it('should return an array of crops', async () => {
      jest.spyOn(cropRepository, 'find').mockResolvedValue(mockCrops);
      jest.spyOn(logger, 'error').mockImplementation();

      const result = await service.findAll();

      expect(result).toEqual(mockCrops);
      expect(cropRepository.find).toHaveBeenCalled();
    });

    it('should throw HttpException when finding all crops fails', async () => {
      jest.spyOn(cropRepository, 'find').mockImplementation(() => {
        throw new Error('Database error');
      });
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.findAll()).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalledWith('Failed to find all crops', expect.any(Error));
    });
  });

  describe('findOne', () => {
    it('should return a crop by id', async () => {
      jest.spyOn(cropRepository, 'findOne').mockResolvedValue(mockCrop);
      jest.spyOn(logger, 'error').mockImplementation();

      const result = await service.findOne('1');

      expect(result).toEqual(mockCrop);
      expect(cropRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw HttpException when crop not found', async () => {
      jest.spyOn(cropRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.findOne('999')).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalledWith('Crop with ID 999 not found');
    });

    it('should throw HttpException when finding crop fails', async () => {
      jest.spyOn(cropRepository, 'findOne').mockImplementation(() => {
        throw new Error('Database error');
      });
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.findOne('1')).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalledWith('Failed to find crop', expect.any(Error));
    });
  });

  describe('update', () => {
    it('should update a crop successfully', async () => {
      const updateCropDto: UpdateCropDto = {
        name: 'Milho Atualizado',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockCrop);
      jest.spyOn(cropRepository, 'merge').mockImplementation();
      jest.spyOn(cropRepository, 'save').mockResolvedValue({ ...mockCrop, ...updateCropDto });
      jest.spyOn(logger, 'error').mockImplementation();

      const result = await service.update('1', updateCropDto);

      expect(result).toEqual({ ...mockCrop, ...updateCropDto });
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(cropRepository.merge).toHaveBeenCalledWith(mockCrop, updateCropDto);
      expect(cropRepository.save).toHaveBeenCalledWith(mockCrop);
    });

    it('should throw HttpException when update fails', async () => {
      const updateCropDto: UpdateCropDto = {
        name: 'Milho Atualizado',
      };

      jest.spyOn(service, 'findOne').mockImplementation(() => {
        throw new Error('Database error');
      });
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.update('1', updateCropDto)).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalledWith('Failed to update crop', expect.any(Error));
    });
  });

  describe('remove', () => {
    it('should remove a crop successfully', async () => {
      jest.spyOn(cropRepository, 'delete').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(logger, 'error').mockImplementation();

      await service.remove('1');

      expect(cropRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw HttpException when crop not found for deletion', async () => {
      jest.spyOn(cropRepository, 'delete').mockResolvedValue({ affected: 0 } as any);
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.remove('999')).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalledWith('Crop with ID 999 was not found');
    });

    it('should throw HttpException when deletion fails', async () => {
      jest.spyOn(cropRepository, 'delete').mockImplementation(() => {
        throw new Error('Database error');
      });
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.remove('1')).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalledWith('Failed to remove crop', expect.any(Error));
    });
  });
});
