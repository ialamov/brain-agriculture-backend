import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { HttpException } from '@nestjs/common';

const mockUsersService = () => ({
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService(),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all users', async () => {
    const mockUsers = [
      { id: '1', email: 'user1@test.com', password: 'hashedPassword1' },
      { id: '2', email: 'user2@test.com', password: 'hashedPassword2' },
    ] as User[];

    jest.spyOn(usersService, 'findAll').mockResolvedValue(mockUsers);

    const result = await controller.findAll();

    expect(result).toEqual(mockUsers);
    expect(usersService.findAll).toHaveBeenCalled();
  });

  it('should update a user', async () => {
    const updateUserDto = { password: 'updatedPassword' };

    jest.spyOn(usersService, 'update').mockResolvedValue({ message: 'User updated successfully' });

    const result = await controller.update('1', updateUserDto);

    expect(result).toEqual({ message: 'User updated successfully' });
    expect(usersService.update).toHaveBeenCalledWith('1', updateUserDto);
  });

  it('should remove a user', async () => {
    jest.spyOn(usersService, 'remove').mockResolvedValue({ message: 'User deleted successfully' });

    const result = await controller.remove('1');

    expect(result).toEqual({ message: 'User deleted successfully' });
    expect(usersService.remove).toHaveBeenCalledWith('1');
  });
});
