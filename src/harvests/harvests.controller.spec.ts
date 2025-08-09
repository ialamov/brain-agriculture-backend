import { Test, TestingModule } from '@nestjs/testing';
import { HarvestsController } from './harvests.controller';
import { HarvestsService } from './harvests.service';
import { Harvest } from '../entities/harvest.entity';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { NotFoundException } from '@nestjs/common';

const mockHarvestsService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('HarvestsController', () => {
  let controller: HarvestsController;
  let harvestsService: HarvestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HarvestsController],
      providers: [
        {
          provide: HarvestsService,
          useValue: mockHarvestsService(),
        },
      ],
    }).compile();

    controller = module.get<HarvestsController>(HarvestsController);
    harvestsService = module.get<HarvestsService>(HarvestsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a harvest successfully', async () => {
      const createHarvestDto: CreateHarvestDto = {
        name: 'Safra de Milho 2024',
        year: 2024,
        farmId: 'farm-id-1',
      };
      const expectedHarvest = {
        id: '1',
        name: 'Safra de Milho 2024',
        year: 2024,
        farm: { id: 'farm-id-1' },
        crops: [],
      } as unknown as Harvest;

      jest.spyOn(harvestsService, 'create').mockResolvedValue(expectedHarvest);

      const result = await controller.create(createHarvestDto);

      expect(result).toEqual(expectedHarvest);
      expect(harvestsService.create).toHaveBeenCalledWith(createHarvestDto);
    });

    it('should throw HttpException when service fails', async () => {
      const createHarvestDto: CreateHarvestDto = {
        name: 'Safra de Milho 2024',
        year: 2024,
        farmId: 'farm-id-1',
      };

      jest.spyOn(harvestsService, 'create').mockRejectedValue(
        new Error('Failed to create harvest')
      );

      await expect(controller.create(createHarvestDto)).rejects.toThrow('Failed to create harvest');
      expect(harvestsService.create).toHaveBeenCalledWith(createHarvestDto);
    });
  });

  describe('findAll', () => {
    it('should return all harvests', async () => {
      const expectedHarvests = [
        {
          id: '1',
          name: 'Safra de Milho 2024',
          year: 2024,
          farm: { id: 'farm-id-1' },
          crops: [],
        },
        {
          id: '2',
          name: 'Safra de Soja 2024',
          year: 2024,
          farm: { id: 'farm-id-2' },
          crops: [],
        },
      ] as unknown as Harvest[];

      jest.spyOn(harvestsService, 'findAll').mockResolvedValue(expectedHarvests);

      const result = await controller.findAll();

      expect(result).toEqual(expectedHarvests);
      expect(harvestsService.findAll).toHaveBeenCalled();
    });

    it('should throw HttpException when service fails', async () => {
      jest.spyOn(harvestsService, 'findAll').mockRejectedValue(
        new Error('Failed to find all harvests')
      );

      await expect(controller.findAll()).rejects.toThrow('Failed to find all harvests');
      expect(harvestsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a harvest by id', async () => {
      const expectedHarvest = {
        id: '1',
        name: 'Safra de Milho 2024',
        year: 2024,
        farm: { id: 'farm-id-1' },
        crops: [],
      } as unknown as Harvest;

      jest.spyOn(harvestsService, 'findOne').mockResolvedValue(expectedHarvest);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedHarvest);
      expect(harvestsService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when harvest not found', async () => {
      jest.spyOn(harvestsService, 'findOne').mockRejectedValue(
        new NotFoundException('Harvest with ID 999 not found')
      );

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(harvestsService.findOne).toHaveBeenCalledWith('999');
    });

    it('should throw HttpException when service fails', async () => {
      jest.spyOn(harvestsService, 'findOne').mockRejectedValue(
        new Error('Failed to find harvest')
      );

      await expect(controller.findOne('1')).rejects.toThrow('Failed to find harvest');
      expect(harvestsService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a harvest successfully', async () => {
      const updateHarvestDto: UpdateHarvestDto = {
        name: 'Safra de Milho 2024 Atualizada',
        year: 2025,
      };
      const expectedHarvest = {
        id: '1',
        name: 'Safra de Milho 2024 Atualizada',
        year: 2025,
        farm: { id: 'farm-id-1' },
        crops: [],
      } as unknown as Harvest;

      jest.spyOn(harvestsService, 'update').mockResolvedValue(expectedHarvest);

      const result = await controller.update('1', updateHarvestDto);

      expect(result).toEqual(expectedHarvest);
      expect(harvestsService.update).toHaveBeenCalledWith('1', updateHarvestDto);
    });

    it('should throw NotFoundException when harvest not found for update', async () => {
      const updateHarvestDto: UpdateHarvestDto = {
        name: 'Updated Harvest',
      };

      jest.spyOn(harvestsService, 'update').mockRejectedValue(
        new NotFoundException('Harvest with ID 999 not found')
      );

      await expect(controller.update('999', updateHarvestDto)).rejects.toThrow(NotFoundException);
      expect(harvestsService.update).toHaveBeenCalledWith('999', updateHarvestDto);
    });

    it('should throw HttpException when service fails', async () => {
      const updateHarvestDto: UpdateHarvestDto = {
        name: 'Updated Harvest',
      };

      jest.spyOn(harvestsService, 'update').mockRejectedValue(
        new Error('Failed to update harvest')
      );

      await expect(controller.update('1', updateHarvestDto)).rejects.toThrow('Failed to update harvest');
      expect(harvestsService.update).toHaveBeenCalledWith('1', updateHarvestDto);
    });
  });

  describe('remove', () => {
    it('should remove a harvest successfully', async () => {
      jest.spyOn(harvestsService, 'remove').mockResolvedValue(undefined);

      await controller.remove('1');

      expect(harvestsService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when harvest not found for removal', async () => {
      jest.spyOn(harvestsService, 'remove').mockRejectedValue(
        new NotFoundException('Harvest with ID 999 was not found')
      );

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
      expect(harvestsService.remove).toHaveBeenCalledWith('999');
    });

    it('should throw HttpException when service fails', async () => {
      jest.spyOn(harvestsService, 'remove').mockRejectedValue(
        new Error('Failed to remove harvest')
      );

      await expect(controller.remove('1')).rejects.toThrow('Failed to remove harvest');
      expect(harvestsService.remove).toHaveBeenCalledWith('1');
    });
  });
});
