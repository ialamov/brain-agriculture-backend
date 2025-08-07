import { Test, TestingModule } from '@nestjs/testing';
import { FarmersController } from './farmers.controller';
import { FarmersService } from './farmers.service';
import { Farmer } from '../entities/farmer.entity';

const mockFarmersService = () => ({
  create: jest.fn(),
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
});
