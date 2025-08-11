import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Farmer } from '../entities/farmer.entity';
import { Farm } from '../entities/farm.entity';
import { Harvest } from '../entities/harvest.entity';
import { Crop } from '../entities/crop.entity';

const mockMetricsService = () => ({
  getMetricsSummary: jest.fn(),
});

const mockFarmerRepository = () => ({
  findAndCount: jest.fn(),
});

const mockFarmRepository = () => ({
  findAndCount: jest.fn(),
});

const mockHarvestRepository = () => ({
  findAndCount: jest.fn(),
});

const mockCropRepository = () => ({
  findAndCount: jest.fn(),
});

describe('MetricsController', () => {
  let controller: MetricsController;
  let metricsService: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: mockMetricsService(),
        },
        {
          provide: getRepositoryToken(Farmer),
          useValue: mockFarmerRepository(),
        },
        {
          provide: getRepositoryToken(Farm),
          useValue: mockFarmRepository(),
        },
        {
          provide: getRepositoryToken(Harvest),
          useValue: mockHarvestRepository(),
        },
        {
          provide: getRepositoryToken(Crop),
          useValue: mockCropRepository(),
        },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
    metricsService = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return metrics summary', async () => {
    const mockData = [
      [[], 0], // farmers
      [[], 0], // farms
      [[], 0], // harvests
      [[], 0], // crops
    ];

    jest.spyOn(metricsService, 'getMetricsSummary').mockResolvedValue(mockData);

    const result = await controller.getMetricsSummary();

    expect(result).toEqual(mockData);
    expect(metricsService.getMetricsSummary).toHaveBeenCalled();
  });
});
