import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private logger: LoggerService,
	) {}

	findAll(): Promise<User[]> {
		try {
			return this.userRepository.find();
		} catch (error) {

			throw new HttpException('Failed to fetch users', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async update(id: string, updateUserDto: UpdateUserDto): Promise<{ message: string }> {
		try {		
			const user = await this.userRepository.update(id, updateUserDto);

			if (user.affected === 0) {
				throw new HttpException('User not found', HttpStatus.NOT_FOUND);
			}

			return { message: 'User updated successfully' };
		} catch (error) {
			throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async remove(email: string): Promise<{ message: string }> {
		try {
			const result = await this.userRepository.delete(email);
			if (result.affected === 0) {
				throw new HttpException(`User with email ${email} was not found`, HttpStatus.NOT_FOUND);
			}
			return { message: 'User deleted successfully' };
		} catch (error) {
			throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
