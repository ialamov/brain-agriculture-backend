import { Test, TestingModule } from '@nestjs/testing';
import { FarmersService } from './farmers.service';
import { Farmer } from '../entities/farmer.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoggerService } from '../common/services/logger.service';

const mockFarmerRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
});

const mockLoggerService = () => ({
  log: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
});

describe('FarmersService', () => {
  let service: FarmersService;
  let farmerRepository: Repository<Farmer>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmersService,
        {
          provide: getRepositoryToken(Farmer),
          useValue: mockFarmerRepository(),
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService(),
        },
      ],
    }).compile();

    service = module.get<FarmersService>(FarmersService);
    farmerRepository = module.get<Repository<Farmer>>(getRepositoryToken(Farmer));
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
