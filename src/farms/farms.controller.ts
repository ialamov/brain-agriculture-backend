import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FarmsService } from './farms.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { AuthGuard } from '@nestjs/passport';
import { Farm } from '../entities/farm.entity';

@ApiTags('Farms')
@ApiBearerAuth()
@Controller('farms')
@UseGuards(AuthGuard('local'))
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @ApiOperation({ summary: 'Create a new farm' })
  @ApiResponse({ status: 201, description: 'Farm created successfully' })
  @Post()
  create(@Body() createFarmDto: CreateFarmDto): Promise<Farm> {
    return this.farmsService.create(createFarmDto);
  }

  @ApiOperation({ summary: 'Get all farms' })
  @ApiResponse({ status: 200, description: 'List of all farms' })
  @Get()
  async findAll(): Promise<Farm[]> {
    const farms = await this.farmsService.findAll();
    return farms;
  }

  @ApiOperation({ summary: 'Get farm by ID' })
  @ApiResponse({ status: 200, description: 'Farm found' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Farm> {
    return this.farmsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update farm' })
  @ApiResponse({ status: 200, description: 'Farm updated successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFarmDto: UpdateFarmDto): Promise<Farm> {
    return this.farmsService.update(id, updateFarmDto);
  }

  @ApiOperation({ summary: 'Delete farm' })
  @ApiResponse({ status: 200, description: 'Farm deleted successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.farmsService.remove(id);
  }
}
