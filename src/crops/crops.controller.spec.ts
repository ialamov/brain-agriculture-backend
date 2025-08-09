import { Test, TestingModule } from '@nestjs/testing';
import { CropsController } from './crops.controller';
import { CropsService } from './crops.service';
import { Crop } from '../entities/crop.entity';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { HttpException, NotFoundException } from '@nestjs/common';

const mockCropsService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockCrops = [
  { id: '1', name: 'Milho', harvest: { id: 'harvest-1' } },
  { id: '2', name: 'Soja', harvest: { id: 'harvest-2' } },
] as Crop[];

const mockCrop = { id: '1', name: 'Milho', harvest: { id: 'harvest-1' } } as Crop;

describe('CropsController', () => {
  let controller: CropsController;
  let cropsService: CropsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CropsController],
      providers: [
        {
          provide: CropsService,
          useValue: mockCropsService(),
        },
      ],
    }).compile();

    controller = module.get<CropsController>(CropsController);
    cropsService = module.get<CropsService>(CropsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new crop', async () => {
      const createCropDto: CreateCropDto = {
        name: 'Milho',
        harvestId: 'harvest-1',
      };

      jest.spyOn(cropsService, 'create').mockResolvedValue(mockCrop);

      const result = await controller.create(createCropDto);

      expect(result).toEqual(mockCrop);
      expect(cropsService.create).toHaveBeenCalledWith(createCropDto);
    });

    it('should handle service errors when creating crop', async () => {
      const createCropDto: CreateCropDto = {
        name: 'Milho',
        harvestId: 'harvest-1',
      };

      jest.spyOn(cropsService, 'create').mockRejectedValue(new HttpException('Failed to create crop', 400));

      await expect(controller.create(createCropDto)).rejects.toThrow(HttpException);
      expect(cropsService.create).toHaveBeenCalledWith(createCropDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of crops', async () => {
      jest.spyOn(cropsService, 'findAll').mockResolvedValue(mockCrops);

      const result = await controller.findAll();

      expect(result).toEqual(mockCrops);
      expect(cropsService.findAll).toHaveBeenCalled();
    });

    it('should handle service errors when finding all crops', async () => {
      jest.spyOn(cropsService, 'findAll').mockRejectedValue(new HttpException('Failed to find all crops', 400));

      await expect(controller.findAll()).rejects.toThrow(HttpException);
      expect(cropsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a crop by id', async () => {
      jest.spyOn(cropsService, 'findOne').mockResolvedValue(mockCrop);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockCrop);
      expect(cropsService.findOne).toHaveBeenCalledWith('1');
    });

    it('should handle NotFoundException when crop not found', async () => {
      jest.spyOn(cropsService, 'findOne').mockRejectedValue(new NotFoundException('Crop with ID 999 not found'));

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(cropsService.findOne).toHaveBeenCalledWith('999');
    });

    it('should handle service errors when finding crop', async () => {
      jest.spyOn(cropsService, 'findOne').mockRejectedValue(new HttpException('Failed to find crop', 400));

      await expect(controller.findOne('1')).rejects.toThrow(HttpException);
      expect(cropsService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a crop', async () => {
      const updateCropDto: UpdateCropDto = {
        name: 'Milho Atualizado',
      };
      const updatedCrop = { ...mockCrop, ...updateCropDto };

      jest.spyOn(cropsService, 'update').mockResolvedValue(updatedCrop);

      const result = await controller.update('1', updateCropDto);

      expect(result).toEqual(updatedCrop);
      expect(cropsService.update).toHaveBeenCalledWith('1', updateCropDto);
    });

    it('should handle NotFoundException when updating non-existent crop', async () => {
      const updateCropDto: UpdateCropDto = {
        name: 'Milho Atualizado',
      };

      jest.spyOn(cropsService, 'update').mockRejectedValue(new NotFoundException('Crop with ID 999 not found'));

      await expect(controller.update('999', updateCropDto)).rejects.toThrow(NotFoundException);
      expect(cropsService.update).toHaveBeenCalledWith('999', updateCropDto);
    });

    it('should handle service errors when updating crop', async () => {
      const updateCropDto: UpdateCropDto = {
        name: 'Milho Atualizado',
      };

      jest.spyOn(cropsService, 'update').mockRejectedValue(new HttpException('Failed to update crop', 400));

      await expect(controller.update('1', updateCropDto)).rejects.toThrow(HttpException);
      expect(cropsService.update).toHaveBeenCalledWith('1', updateCropDto);
    });
  });

  describe('remove', () => {
    it('should remove a crop', async () => {
      jest.spyOn(cropsService, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toBeUndefined();
      expect(cropsService.remove).toHaveBeenCalledWith('1');
    });

    it('should handle NotFoundException when removing non-existent crop', async () => {
      jest.spyOn(cropsService, 'remove').mockRejectedValue(new NotFoundException('Crop with ID 999 was not found'));

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
      expect(cropsService.remove).toHaveBeenCalledWith('999');
    });

    it('should handle service errors when removing crop', async () => {
      jest.spyOn(cropsService, 'remove').mockRejectedValue(new HttpException('Failed to remove crop', 400));

      await expect(controller.remove('1')).rejects.toThrow(HttpException);
      expect(cropsService.remove).toHaveBeenCalledWith('1');
    });
  });
});
