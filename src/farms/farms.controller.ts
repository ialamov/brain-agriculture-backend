import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FarmsService } from './farms.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { AuthGuard } from '@nestjs/passport';
import { Farm } from '../entities/farm.entity';

@ApiTags('Farms')
@Controller('farms')
@UseGuards(AuthGuard('jwt'))
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @ApiOperation({ summary: 'Create a new farm' }) 
  @ApiResponse({ status: 201, description: 'Farm created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @Post()
  create(@Body() createFarmDto: CreateFarmDto): Promise<Farm> {
    return this.farmsService.create(createFarmDto);
  }

  @ApiOperation({ summary: 'Get all farms with pagination' })
  @ApiResponse({ status: 200, description: 'List of all farms with total count' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Page size (default: 10)' })
  @ApiBearerAuth()
  @Get()
  async findAll(
    @Query('page') page: number = 1, 
    @Query('pageSize') pageSize: number = 10
  ): Promise<{ farms: Farm[]; total: number }> {

    const validPage = Math.max(1, Number(page) || 1);
    const validPageSize = Math.max(1, Math.min(100, Number(pageSize) || 10));
    
    return this.farmsService.findAll(validPage, validPageSize);
  }

  @ApiOperation({ summary: 'Get farm by ID' })
  @ApiResponse({ status: 200, description: 'Farm found successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Farm> {
    return this.farmsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update farm by ID' })
  @ApiResponse({ status: 200, description: 'Farm updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFarmDto: UpdateFarmDto): Promise<Farm> {
    return this.farmsService.update(id, updateFarmDto);
  }

  @ApiOperation({ summary: 'Delete farm by ID' })
  @ApiResponse({ status: 200, description: 'Farm deleted successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.farmsService.remove(id);
  }
}
