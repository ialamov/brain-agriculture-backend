import { Test, TestingModule } from '@nestjs/testing';
import { FarmsController } from './farms.controller';
import { FarmsService } from './farms.service';
import { Farm } from '../entities/farm.entity';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LoggerService } from '../common/services/logger.service';

const mockFarmsService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockLoggerService = () => ({
  error: jest.fn(),
});

describe('FarmsController', () => {
  let controller: FarmsController;
  let farmsService: FarmsService;
  let loggerService: LoggerService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FarmsController],
      providers: [
        {
          provide: FarmsService,
          useValue: mockFarmsService(),
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService(),
        },
      ],
    }).compile();

    controller = module.get<FarmsController>(FarmsController);
    farmsService = module.get<FarmsService>(FarmsService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      jest.spyOn(farmsService, 'create').mockResolvedValue(expectedFarm);

      const result = await controller.create(createFarmDto);

      expect(result).toEqual(expectedFarm);
      expect(farmsService.create).toHaveBeenCalledWith(createFarmDto);
    });

    it('should throw BadRequestException when cultivation area is greater than total area', async () => {
      const createFarmDto: CreateFarmDto = {
        name: 'Invalid Farm',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 50.0,
        cultivationArea: 60.0, // Greater than total area
        vegetationArea: 10.0,
        farmerId: 'farmer-id-1',
      };

      jest.spyOn(farmsService, 'create').mockRejectedValue(
        new BadRequestException('Cultivation area cannot be greater than total area')
      );

      await expect(controller.create(createFarmDto)).rejects.toThrow(
        BadRequestException
      );
      expect(farmsService.create).toHaveBeenCalledWith(createFarmDto);
    });

    it('should throw BadRequestException when vegetation area is greater than total area', async () => {
      const createFarmDto: CreateFarmDto = {
        name: 'Invalid Farm',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 50.0,
        cultivationArea: 30.0,
        vegetationArea: 60.0,
        farmerId: 'farmer-id-1',
      };

      jest.spyOn(farmsService, 'create').mockRejectedValue(
        new BadRequestException('Vegetation area cannot be greater than total area')
      );

      await expect(controller.create(createFarmDto)).rejects.toThrow(
        BadRequestException
      );
      expect(farmsService.create).toHaveBeenCalledWith(createFarmDto);
    });

    it('should throw BadRequestException when cultivation and vegetation area sum is greater than total area', async () => {
      const createFarmDto: CreateFarmDto = {
        name: 'Invalid Farm',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 50.0,
        cultivationArea: 30.0,
        vegetationArea: 25.0,
        farmerId: 'farmer-id-1',
      };

      jest.spyOn(farmsService, 'create').mockRejectedValue(
        new BadRequestException('Cultivation and vegetation area cannot be greater than total area')
      );

      await expect(controller.create(createFarmDto)).rejects.toThrow(
        BadRequestException
      );
      expect(farmsService.create).toHaveBeenCalledWith(createFarmDto);
    });
  });

  describe('findAll', () => {
    it('should return all farms', async () => {
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

      jest.spyOn(farmsService, 'findAll').mockResolvedValue(expectedFarms);

      const result = await controller.findAll();

      expect(result).toEqual(expectedFarms);
      expect(farmsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a farm by id', async () => {
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

      jest.spyOn(farmsService, 'findOne').mockResolvedValue(expectedFarm);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedFarm);
      expect(farmsService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when farm not found', async () => {
      jest.spyOn(farmsService, 'findOne').mockRejectedValue(
        new NotFoundException('Farm with ID 999 not found')
      );

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(farmsService.findOne).toHaveBeenCalledWith('999');
    });
  });

  describe('update', () => {
    it('should update a farm successfully', async () => {
      const updateFarmDto: UpdateFarmDto = {
        name: 'Fazenda São João Atualizada',
        cultivationArea: 85.0,
      };
      const expectedFarm = {
        id: '1',
        name: 'Fazenda São João Atualizada',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 100.5,
        cultivationArea: 85.0,
        vegetationArea: 20.5,
        farmer: { id: 'farmer-id-1' },
        harvests: [],
      } as unknown as Farm;

      jest.spyOn(farmsService, 'update').mockResolvedValue(expectedFarm);

      const result = await controller.update('1', updateFarmDto);

      expect(result).toEqual(expectedFarm);
      expect(farmsService.update).toHaveBeenCalledWith('1', updateFarmDto);
    });

    it('should throw BadRequestException when updated cultivation area is greater than total area', async () => {
      const updateFarmDto: UpdateFarmDto = {
        cultivationArea: 120.0, // Greater than total area
      };

      jest.spyOn(farmsService, 'update').mockRejectedValue(
        new BadRequestException('Cultivation area cannot be greater than total area')
      );

      await expect(controller.update('1', updateFarmDto)).rejects.toThrow(
        BadRequestException
      );
      expect(farmsService.update).toHaveBeenCalledWith('1', updateFarmDto);
    });

    it('should throw NotFoundException when farm not found for update', async () => {
      const updateFarmDto: UpdateFarmDto = {
        name: 'Updated Farm',
      };

      jest.spyOn(farmsService, 'update').mockRejectedValue(
        new NotFoundException('Farm with ID 999 not found')
      );

      await expect(controller.update('999', updateFarmDto)).rejects.toThrow(
        NotFoundException
      );
      expect(farmsService.update).toHaveBeenCalledWith('999', updateFarmDto);
    });
  });

  describe('remove', () => {
    it('should remove a farm successfully', async () => {
      jest.spyOn(farmsService, 'remove').mockResolvedValue(undefined);

      await controller.remove('1');

      expect(farmsService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when farm not found for removal', async () => {
      jest.spyOn(farmsService, 'remove').mockRejectedValue(
        new NotFoundException('Farm with ID 999 was not found')
      );

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
      expect(farmsService.remove).toHaveBeenCalledWith('999');
    });
  });
});
