import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { UserWithoutPassword } from './dto/user.interface';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private logger: LoggerService,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<{ accessToken: string }> {
      let user = await this.userRepository.findOne({ where: { email: createUserDto.email } });
      
      if (user) {
        throw new BadRequestException('User already exists');
      }
      
      user = await this.userRepository.create(createUserDto);
      user = await this.userRepository.save(user);
  
      return this.login({ email: user.email, password: createUserDto.password });
    }

    async validateUser(email: string, pass: string): Promise<UserWithoutPassword | null> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (user && await bcrypt.compare(pass, user.password)) {
          const { password, ...result } = user;
          return result as UserWithoutPassword;
        }
        return null;
    }

    async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            this.logger.error('Invalid credentials', undefined, 'AuthService');
            throw new BadRequestException('Invalid credentials');
        }
        return {
          accessToken: this.jwtService.sign({ username: user.email, sub: user.id }),
        };
    }
}
