import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CropsService } from './crops.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { Crop } from '../entities/crop.entity';

@ApiTags('Crops')
@Controller('crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @ApiOperation({ summary: 'Create a new crop' })
  @ApiResponse({ status: 201, description: 'Crop created successfully' })
  @Post()
  async create(@Body() createCropDto: CreateCropDto): Promise<Crop> {
    return this.cropsService.create(createCropDto);
  }

  @ApiOperation({ summary: 'Get all crops' })
  @ApiResponse({ status: 200, description: 'List of all crops' })
  @Get()
  async findAll(): Promise<Crop[]> {
    return this.cropsService.findAll();
  }

  @ApiOperation({ summary: 'Get crop by ID' })
  @ApiResponse({ status: 200, description: 'Crop found' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Crop> {
    return this.cropsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update crop' })
  @ApiResponse({ status: 200, description: 'Crop updated successfully' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCropDto: UpdateCropDto): Promise<Crop> {
    return this.cropsService.update(id, updateCropDto);
  }

  @ApiOperation({ summary: 'Delete crop' })
  @ApiResponse({ status: 200, description: 'Crop deleted successfully' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.cropsService.remove(id);
  }
}
