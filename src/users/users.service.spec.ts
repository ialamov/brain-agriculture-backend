import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';
import { LoggerService } from '../common/services/logger.service';

const mockUserRepository = () => ({
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockLoggerService = () => ({
  log: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
});

const mockUsers = [
  { id: '1', email: 'user1@test.com', password: 'hashedPassword1' },
  { id: '2', email: 'user2@test.com', password: 'hashedPassword2' },
] as User[];

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository(),
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {

      jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);
      jest.spyOn(logger, 'log').mockImplementation();

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const mockUser = { id: '1', email: 'user1@test.com', password: 'hashedPassword1' } as User;
      const updateUserDto = { password: 'updatedPassword' };

      jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as UpdateResult);
      jest.spyOn(logger, 'log').mockImplementation();

      const result = await service.update(mockUser.id, updateUserDto);

      expect(result).toEqual({ message: 'User updated successfully' });
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, updateUserDto);

      jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 0 } as UpdateResult);

      await expect(service.update(mockUser.id, updateUserDto)).rejects.toThrow(HttpException);
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const mockUser = { id: '1', email: 'user1@test.com', password: 'hashedPassword1' } as User;

      jest.spyOn(userRepository, 'delete').mockResolvedValue({ affected: 1 } as DeleteResult);

      const result = await service.remove(mockUser.email);

      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(userRepository.delete).toHaveBeenCalledWith(mockUser.email);

      jest.spyOn(userRepository, 'delete').mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(service.remove(mockUser.email)).rejects.toThrow(HttpException);
      expect(userRepository.delete).toHaveBeenCalledWith(mockUser.email);
    });
  });
});
