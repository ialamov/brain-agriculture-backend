import { Test, TestingModule } from '@nestjs/testing';
import { CropsService } from './crops.service';
import { Crop } from '../entities/crop.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { LoggerService } from '../common/services/logger.service';

const mockCropRepository = () => ({
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

describe('CropsService', () => {
  let service: CropsService;
  let cropRepository: Repository<Crop>;
  let loggerService: LoggerService;

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
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a crop successfully', async () => {
      const createCropDto: CreateCropDto = {
        name: 'Corn',
        harvestId: 'harvest-id-1',
      };
      const expectedCrop = {
        id: '1',
        name: 'Corn',
        harvest: { id: 'harvest-id-1' },
      } as unknown as Crop;

      jest.spyOn(cropRepository, 'create').mockReturnValue(expectedCrop);
      jest.spyOn(cropRepository, 'save').mockResolvedValue(expectedCrop);

      const result = await service.create(createCropDto);

      expect(result).toEqual(expectedCrop);
      expect(cropRepository.create).toHaveBeenCalledWith(createCropDto);
      expect(cropRepository.save).toHaveBeenCalledWith(expectedCrop);
    });

    it('should throw HttpException for database error', async () => {
      const createCropDto: CreateCropDto = {
        name: 'Corn',
        harvestId: 'harvest-id-1',
      };

      jest.spyOn(cropRepository, 'create').mockImplementation(() => {
        throw new Error('Database error');
      });
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.create(createCropDto)).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to create crop', expect.any(Error));
    });
  });

  describe('findAll', () => {
    it('should return all crops', async () => {
      const expectedCrops = [
        { id: '1', name: 'Corn', harvest: { id: 'harvest-id-1' } },
        { id: '2', name: 'Soybeans', harvest: { id: 'harvest-id-2' } },
      ] as unknown as Crop[];

      jest.spyOn(cropRepository, 'find').mockResolvedValue(expectedCrops);

      const result = await service.findAll();

      expect(result).toEqual(expectedCrops);
      expect(cropRepository.find).toHaveBeenCalled();
    });

    it('should throw HttpException for database error', async () => {
      jest.spyOn(cropRepository, 'find').mockImplementation(() => {
        throw new Error('Database error');
      });
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.findAll()).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to find all crops', expect.any(Error));
    });
  });

  describe('findOne', () => {
    it('should return a crop by id', async () => {
      const expectedCrop = {
        id: '1',
        name: 'Corn',
        harvest: { id: 'harvest-id-1' },
      } as unknown as Crop;

      jest.spyOn(cropRepository, 'findOne').mockResolvedValue(expectedCrop);

      const result = await service.findOne('1');

      expect(result).toEqual(expectedCrop);
      expect(cropRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException when crop not found', async () => {
      jest.spyOn(cropRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      expect(loggerService.error).toHaveBeenCalledWith('Crop with ID 999 not found');
    });

    it('should throw HttpException for database error', async () => {
      jest.spyOn(cropRepository, 'findOne').mockRejectedValue(new Error('Database error'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.findOne('1')).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to find crop', expect.any(Error));
    });
  });

  describe('update', () => {
    it('should update a crop successfully', async () => {
      const updateCropDto: UpdateCropDto = {
        name: 'Updated Corn',
      };
      const existingCrop = {
        id: '1',
        name: 'Corn',
        harvest: { id: 'harvest-id-1' },
      } as unknown as Crop;
      const updatedCrop = {
        ...existingCrop,
        name: 'Updated Corn',
      } as unknown as Crop;

      jest.spyOn(service, 'findOne').mockResolvedValue(existingCrop);
      jest.spyOn(cropRepository, 'merge').mockImplementation((crop, dto) => {
        Object.assign(crop, dto);
        return crop;
      });
      jest.spyOn(cropRepository, 'save').mockResolvedValue(updatedCrop);

      const result = await service.update('1', updateCropDto);

      expect(result).toEqual(updatedCrop);
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(cropRepository.merge).toHaveBeenCalledWith(existingCrop, updateCropDto);
      expect(cropRepository.save).toHaveBeenCalledWith(updatedCrop);
    });

    it('should throw NotFoundException when crop not found during update', async () => {
      const updateCropDto: UpdateCropDto = {
        name: 'Updated Name',
      };

      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Crop with ID 1 not found'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.update('1', updateCropDto)).rejects.toThrow(NotFoundException);
      expect(loggerService.error).not.toHaveBeenCalled();
    });

    it('should throw HttpException for database error during update', async () => {
      const updateCropDto: UpdateCropDto = {
        name: 'Updated Name',
      };

      jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Database error'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.update('1', updateCropDto)).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to update crop', expect.any(Error));
    });
  });

  describe('remove', () => {
    it('should remove a crop successfully', async () => {
      jest.spyOn(cropRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await service.remove('1');

      expect(cropRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when crop not found', async () => {
      jest.spyOn(cropRepository, 'delete').mockResolvedValue({ affected: 0 } as any);
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      expect(loggerService.error).toHaveBeenCalledWith('Crop with ID 999 was not found');
    });

    it('should throw HttpException for database error', async () => {
      jest.spyOn(cropRepository, 'delete').mockRejectedValue(new Error('Database error'));
      jest.spyOn(loggerService, 'error').mockImplementation();

      await expect(service.remove('1')).rejects.toThrow(HttpException);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to remove crop', expect.any(Error));
    });
  });
});
