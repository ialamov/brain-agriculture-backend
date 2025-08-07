import { Test, TestingModule } from '@nestjs/testing';
import { FarmersController } from './farmers.controller';
import { FarmersService } from './farmers.service';
import { Farmer } from '../entities/farmer.entity';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { BadRequestException, HttpException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

const mockFarmersService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('FarmersController', () => {
  let controller: FarmersController;
  let farmersService: FarmersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FarmersController],
      providers: [
        {
          provide: FarmersService,
          useValue: mockFarmersService(),
        },
      ],
    }).compile();

    controller = module.get<FarmersController>(FarmersController);
    farmersService = module.get<FarmersService>(FarmersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      jest.spyOn(farmersService, 'create').mockResolvedValue(expectedFarmer);

      const result = await controller.create(createFarmerDto);

      expect(result).toEqual(expectedFarmer);
      expect(farmersService.create).toHaveBeenCalledWith(createFarmerDto);
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

      jest.spyOn(farmersService, 'create').mockResolvedValue(expectedFarmer);

      const result = await controller.create(createFarmerDto);

      expect(result).toEqual(expectedFarmer);
      expect(farmersService.create).toHaveBeenCalledWith(createFarmerDto);
    });

    it('should throw BadRequestException when farmer has both CPF and CNPJ', async () => {
      const createFarmerDto: CreateFarmerDto = {
        name: 'Invalid Farmer',
        cpf: '123.456.789-00',
        cnpj: '12.345.678/0001-90',
      };

      jest.spyOn(farmersService, 'create').mockRejectedValue(
        new BadRequestException('Farmer cannot have both CNPJ and CPF')
      );

      await expect(controller.create(createFarmerDto)).rejects.toThrow(
        BadRequestException
      );
      expect(farmersService.create).toHaveBeenCalledWith(createFarmerDto);
    });

    it('should throw BadRequestException when farmer has neither CPF nor CNPJ', async () => {
      const createFarmerDto: CreateFarmerDto = {
        name: 'Invalid Farmer',
        cpf: undefined,
        cnpj: undefined,
      };

      jest.spyOn(farmersService, 'create').mockRejectedValue(
        new BadRequestException('Farmer must have either CNPJ or CPF')
      );

      await expect(controller.create(createFarmerDto)).rejects.toThrow(
        BadRequestException
      );
      expect(farmersService.create).toHaveBeenCalledWith(createFarmerDto);
    });

    it('should throw BadRequestException for invalid CPF', async () => {
      const createFarmerDto: CreateFarmerDto = {
        name: 'Invalid Farmer',
        cpf: '123.456.789-99', // Invalid CPF
        cnpj: undefined,
      };

      jest.spyOn(farmersService, 'create').mockRejectedValue(
        new BadRequestException('Invalid CPF')
      );

      await expect(controller.create(createFarmerDto)).rejects.toThrow(
        BadRequestException
      );
      expect(farmersService.create).toHaveBeenCalledWith(createFarmerDto);
    });

    it('should throw BadRequestException for invalid CNPJ', async () => {
      const createFarmerDto: CreateFarmerDto = {
        name: 'Invalid Company',
        cpf: undefined,
        cnpj: '12.345.678/0001-99', // Invalid CNPJ
      };

      jest.spyOn(farmersService, 'create').mockRejectedValue(
        new BadRequestException('Invalid CNPJ')
      );

      await expect(controller.create(createFarmerDto)).rejects.toThrow(
        BadRequestException
      );
      expect(farmersService.create).toHaveBeenCalledWith(createFarmerDto);
    });

    it('should throw HttpException for internal server error', async () => {
      const createFarmerDto: CreateFarmerDto = {
        name: 'Test Farmer',
        cpf: '123.456.789-00',
        cnpj: undefined,
      };

      jest.spyOn(farmersService, 'create').mockRejectedValue(
        new HttpException('Failed to create farmer', 500)
      );

      await expect(controller.create(createFarmerDto)).rejects.toThrow(
        HttpException
      );
      expect(farmersService.create).toHaveBeenCalledWith(createFarmerDto);
    });

    it('should handle validation errors', async () => {
      const invalidFarmerDto = {
        name: 'A', // too short
        cpf: 'invalid-cpf',
        cnpj: 'invalid-cnpj',
      };

      jest.spyOn(farmersService, 'create').mockRejectedValue(
        new BadRequestException('Validation failed')
      );

      await       expect(controller.create(invalidFarmerDto as CreateFarmerDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('findAll', () => {
    it('should return all farmers', async () => {
      const expectedFarmers = [
        { id: '1', name: 'Farmer 1', cpf: '123.456.789-00', cnpj: null, farm: [] },
        { id: '2', name: 'Farmer 2', cpf: null, cnpj: '12.345.678/0001-90', farm: [] },
      ] as unknown as Farmer[];

      jest.spyOn(farmersService, 'findAll').mockResolvedValue(expectedFarmers);

      const result = await controller.findAll();

      expect(result).toEqual(expectedFarmers);
      expect(farmersService.findAll).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException for database error', async () => {
      jest.spyOn(farmersService, 'findAll').mockRejectedValue(
        new InternalServerErrorException('Error finding all farmers')
      );

      await expect(controller.findAll()).rejects.toThrow(InternalServerErrorException);
      expect(farmersService.findAll).toHaveBeenCalled();
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

      jest.spyOn(farmersService, 'findOne').mockResolvedValue(expectedFarmer);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedFarmer);
      expect(farmersService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when farmer not found', async () => {
      jest.spyOn(farmersService, 'findOne').mockRejectedValue(
        new NotFoundException('Farmer with ID 999 not found')
      );

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(farmersService.findOne).toHaveBeenCalledWith('999');
    });

    it('should throw InternalServerErrorException for database error', async () => {
      jest.spyOn(farmersService, 'findOne').mockRejectedValue(
        new InternalServerErrorException('Error finding farmer')
      );

      await expect(controller.findOne('1')).rejects.toThrow(InternalServerErrorException);
      expect(farmersService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a farmer successfully', async () => {
      const updateFarmerDto = { name: 'Updated Name' };
      const expectedFarmer = {
        id: '1',
        name: 'Updated Name',
        cpf: '123.456.789-00',
        cnpj: null,
        farm: [],
      } as unknown as Farmer;

      jest.spyOn(farmersService, 'update').mockResolvedValue(expectedFarmer);

      const result = await controller.update('1', updateFarmerDto);

      expect(result).toEqual(expectedFarmer);
      expect(farmersService.update).toHaveBeenCalledWith('1', updateFarmerDto);
    });

    it('should throw NotFoundException when farmer not found', async () => {
      const updateFarmerDto = { name: 'Updated Name' };

      jest.spyOn(farmersService, 'update').mockRejectedValue(
        new NotFoundException('Farmer with ID 999 not found')
      );

      await expect(controller.update('999', updateFarmerDto)).rejects.toThrow(NotFoundException);
      expect(farmersService.update).toHaveBeenCalledWith('999', updateFarmerDto);
    });

    it('should throw InternalServerErrorException for database error', async () => {
      const updateFarmerDto = { name: 'Updated Name' };

      jest.spyOn(farmersService, 'update').mockRejectedValue(
        new InternalServerErrorException('Error updating farmer')
      );

      await expect(controller.update('1', updateFarmerDto)).rejects.toThrow(InternalServerErrorException);
      expect(farmersService.update).toHaveBeenCalledWith('1', updateFarmerDto);
    });
  });

  describe('remove', () => {
    it('should remove a farmer successfully', async () => {
      jest.spyOn(farmersService, 'remove').mockResolvedValue(undefined);

      await controller.remove('1');

      expect(farmersService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when farmer not found', async () => {
      jest.spyOn(farmersService, 'remove').mockRejectedValue(
        new NotFoundException('Farmer with ID 999 was not found')
      );

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
      expect(farmersService.remove).toHaveBeenCalledWith('999');
    });

    it('should throw InternalServerErrorException for database error', async () => {
      jest.spyOn(farmersService, 'remove').mockRejectedValue(
        new InternalServerErrorException('Error deleting farmer')
      );

      await expect(controller.remove('1')).rejects.toThrow(InternalServerErrorException);
      expect(farmersService.remove).toHaveBeenCalledWith('1');
    });
  });
});
