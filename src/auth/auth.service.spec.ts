import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '../common/services/logger.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const mockUserRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

const mockLoggerService = () => ({
  log: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = { email: 'test@test.com', password: 'password' };
      const mockUser = { 
        id: '1', 
        email: 'test@test.com', 
        password: 'hashedPassword',
        hashPassword: jest.fn()
      } as User;
      
      const findOneSpy = jest.spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(null);
      
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('test-token');
      jest.spyOn(logger, 'log').mockImplementation();
      jest.spyOn(logger, 'error').mockImplementation();

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      const result = await service.create(createUserDto);
      
      expect(result).toEqual({ 
        accessToken: 'test-token',
        user: { id: '1', email: 'test@test.com' }
      });
      expect(findOneSpy).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw BadRequestException when user already exists', async () => {
      const createUserDto = { email: 'existing@test.com', password: 'password' };
      const existingUser = { id: '1', email: 'existing@test.com', password: 'hashedPassword' } as User;
      
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow('User already exists');
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'existing@test.com' } });
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const loginDto = { email: 'test@test.com', password: 'password' };
      const mockUser = { id: '1', email: 'test@test.com', password: 'hashedPassword' } as User;
      
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('test-token');
      jest.spyOn(logger, 'log').mockImplementation();
      jest.spyOn(logger, 'error').mockImplementation();

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);
      
      expect(result).toEqual({ 
        accessToken: 'test-token',
        user: { id: '1', email: 'test@test.com' }
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'test@test.com', sub: '1' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should throw BadRequestException for invalid credentials', async () => {
      const loginDto = { email: 'test@test.com', password: 'wrongpassword' };
      
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(logger, 'error').mockImplementation();

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
      expect(logger.error).toHaveBeenCalledWith('Invalid credentials', undefined, 'AuthService');
    });
  });
});
