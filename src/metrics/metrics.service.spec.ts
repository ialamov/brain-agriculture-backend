import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Farmer } from '../entities/farmer.entity';
import { Farm } from '../entities/farm.entity';
import { Harvest } from '../entities/harvest.entity';
import { Crop } from '../entities/crop.entity';

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

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
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

    service = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return metrics summary', async () => {
    const mockData = [
      [[], 0], // farmers
      [[], 0], // farms
      [[], 0], // harvests
      [[], 0], // crops
    ];

    const module = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: getRepositoryToken(Farmer),
          useValue: { findAndCount: jest.fn().mockResolvedValue(mockData[0]) },
        },
        {
          provide: getRepositoryToken(Farm),
          useValue: { findAndCount: jest.fn().mockResolvedValue(mockData[1]) },
        },
        {
          provide: getRepositoryToken(Harvest),
          useValue: { findAndCount: jest.fn().mockResolvedValue(mockData[2]) },
        },
        {
          provide: getRepositoryToken(Crop),
          useValue: { findAndCount: jest.fn().mockResolvedValue(mockData[3]) },
        },
      ],
    }).compile();

    const testService = module.get<MetricsService>(MetricsService);
    const result = await testService.getMetricsSummary();

    expect(result).toEqual(mockData);
  });
});
