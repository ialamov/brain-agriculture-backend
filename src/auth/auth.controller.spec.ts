import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { BadRequestException } from '@nestjs/common';
import { Response } from 'express';

const mockAuthService = () => ({
  create: jest.fn(),
  login: jest.fn(),
});

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService(),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { accessToken: 'test-jwt-token', user: { id: '1', email: 'test@example.com' } };

      jest.spyOn(authService, 'create').mockResolvedValue(expectedResult);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(expectedResult);
      expect(authService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw BadRequestException when user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
      };

      jest.spyOn(authService, 'create').mockRejectedValue(
        new BadRequestException('User already exists')
      );

      await expect(controller.register(createUserDto)).rejects.toThrow(
        BadRequestException
      );
      expect(authService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle validation errors', async () => {
      const invalidUserDto = {
        email: 'invalid-email',
        password: '123', // too short
      };

      jest.spyOn(authService, 'create').mockRejectedValue(
        new BadRequestException('Validation failed')
      );

      await expect(controller.register(invalidUserDto as CreateUserDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = {
        header: jest.fn(),
      } as unknown as Response;
      
      const authServiceResult = { 
        accessToken: 'test-jwt-token', 
        user: { id: '1', email: 'test@example.com' } 
      };

      jest.spyOn(authService, 'login').mockResolvedValue(authServiceResult);

      const result = await controller.login(loginDto, mockResponse);

      expect(result).toEqual(authServiceResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw BadRequestException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const mockResponse = {
        header: jest.fn(),
      } as unknown as Response;

      jest.spyOn(authService, 'login').mockRejectedValue(
        new BadRequestException('Invalid credentials')
      );

      await expect(controller.login(loginDto, mockResponse)).rejects.toThrow(
        BadRequestException
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle non-existent user', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };
      const mockResponse = {
        header: jest.fn(),
      } as unknown as Response;

      jest.spyOn(authService, 'login').mockRejectedValue(
        new BadRequestException('Invalid credentials')
      );

      await expect(controller.login(loginDto, mockResponse)).rejects.toThrow(
        BadRequestException
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle validation errors for login', async () => {
      const invalidLoginDto = {
        email: 'invalid-email',
        password: '', // empty password
      };
      const mockResponse = {
        header: jest.fn(),
      } as unknown as Response;

      jest.spyOn(authService, 'login').mockRejectedValue(
        new BadRequestException('Validation failed')
      );

      await expect(controller.login(invalidLoginDto as LoginDto, mockResponse)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
