import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Crop } from '../entities/crop.entity';
import { Repository } from 'typeorm';
import { LoggerService } from '../common/services/logger.service';


@Injectable()
export class CropsService {
  constructor(
    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,
    private readonly loggerService: LoggerService
  ) {}

  async create(createCropDto: CreateCropDto): Promise<Crop> {
    try {
      const crop = this.cropRepository.create(createCropDto);
      return this.cropRepository.save(crop);
    } catch (error) {
      this.loggerService.error('Failed to create crop', error);
      throw new HttpException('Failed to create crop', HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(): Promise<Crop[]> {
    try {
      return this.cropRepository.find();
    } catch (error) {
      this.loggerService.error('Failed to find all crops', error);
      throw new HttpException('Failed to find all crops', HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: string): Promise<Crop> {
    try {
      const crop = await this.cropRepository.findOne({ where: { id } });
      if (!crop) {
        this.loggerService.error(`Crop with ID ${id} not found`);
        throw new NotFoundException(`Crop with ID ${id} not found`);
    }
      return crop;
    } catch (error) {
      this.loggerService.error('Failed to find crop', error);
      throw new HttpException('Failed to find crop', HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: string, updateCropDto: UpdateCropDto): Promise<Crop> {
    try {
    const crop = await this.findOne(id);
      this.cropRepository.merge(crop, updateCropDto);
      return this.cropRepository.save(crop);
    } catch (error) {
      this.loggerService.error('Failed to update crop', error);
      throw new HttpException('Failed to update crop', HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.cropRepository.delete(id);
      if (result.affected === 0) {
        this.loggerService.error(`Crop with ID ${id} was not found`);
        throw new NotFoundException(`Crop with ID ${id} was not found`);
      }
    } catch (error) {
      this.loggerService.error('Failed to remove crop', error);
      throw new HttpException('Failed to remove crop', HttpStatus.BAD_REQUEST);
    }
  }
}
