import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Farmer } from '../entities/farmer.entity';
import { Farm } from '../entities/farm.entity';
import { Harvest } from '../entities/harvest.entity';
import { Crop } from '../entities/crop.entity';
import { LoggerService } from '../common/services/logger.service';

const mockFarmerRepository = () => ({
  findAndCount: jest.fn(),
  count: jest.fn(),
  metadata: { tableName: 'farmers' },
});

const mockFarmRepository = () => ({
  findAndCount: jest.fn(),
  count: jest.fn(),
  metadata: { tableName: 'farms' },
  query: jest.fn(),
});

const mockHarvestRepository = () => ({
  findAndCount: jest.fn(),
  count: jest.fn(),
  metadata: { tableName: 'harvests' },
  query: jest.fn(),
});

const mockCropRepository = () => ({
  findAndCount: jest.fn(),
  count: jest.fn(),
  metadata: { tableName: 'crops' },
  query: jest.fn(),
});

const mockLoggerService = () => ({
  error: jest.fn(),
  log: jest.fn(),
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
        {
          provide: LoggerService,
          useValue: mockLoggerService(),
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
          useValue: { 
            findAndCount: jest.fn().mockResolvedValue(mockData[0]),
            count: jest.fn().mockResolvedValue(0),
            metadata: { tableName: 'farmers' }
          },
        },
        {
          provide: getRepositoryToken(Farm),
          useValue: { 
            findAndCount: jest.fn().mockResolvedValue(mockData[1]),
            count: jest.fn().mockResolvedValue(0),
            metadata: { tableName: 'farms' }
          },
        },
        {
          provide: getRepositoryToken(Harvest),
          useValue: { 
            findAndCount: jest.fn().mockResolvedValue(mockData[2]),
            count: jest.fn().mockResolvedValue(0),
            metadata: { tableName: 'harvests' }
          },
        },
        {
          provide: getRepositoryToken(Crop),
          useValue: { 
            findAndCount: jest.fn().mockResolvedValue(mockData[3]),
            count: jest.fn().mockResolvedValue(0),
            metadata: { tableName: 'crops' }
          },
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService(),
        },
      ],
    }).compile();

    const testService = module.get<MetricsService>(MetricsService);
    const result = await testService.getMetricsSummary();

    expect(result).toEqual({
      farmers: 0,
      farms: 0,
      harvests: 0,
      crops: 0,
    });
  });
});
