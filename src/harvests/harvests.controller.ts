import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HarvestsService } from './harvests.service';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { AuthGuard } from '@nestjs/passport';
import { Harvest } from '../entities/harvest.entity';

@ApiTags('Harvests')
@ApiBearerAuth()
@Controller('harvests')
@UseGuards(AuthGuard('jwt'))
export class HarvestsController {
  constructor(private readonly harvestsService: HarvestsService) {}

  @ApiOperation({ summary: 'Create a new harvest' })
  @ApiResponse({ status: 201, description: 'Harvest created successfully' })
  @ApiBearerAuth()
  @Post()
  async create(@Body() createHarvestDto: CreateHarvestDto): Promise<Harvest> {
    return this.harvestsService.create(createHarvestDto);
  }

  @ApiOperation({ summary: 'Get all harvests' })
  @ApiResponse({ status: 200, description: 'List of all harvests' })
  @ApiBearerAuth()
  @Get()
  async findAll(): Promise<Harvest[]> {
    return this.harvestsService.findAll();
  }

  @ApiOperation({ summary: 'Get harvest by ID' })
  @ApiResponse({ status: 200, description: 'Harvest found' })
  @ApiResponse({ status: 404, description: 'Harvest not found' })
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Harvest> {
    return this.harvestsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update harvest' })
  @ApiResponse({ status: 200, description: 'Harvest updated successfully' })
  @ApiResponse({ status: 404, description: 'Harvest not found' })
  @ApiBearerAuth()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateHarvestDto: UpdateHarvestDto): Promise<Harvest> {
    return this.harvestsService.update(id, updateHarvestDto);
  }

  @ApiOperation({ summary: 'Delete harvest' })
  @ApiResponse({ status: 200, description: 'Harvest deleted successfully' })
  @ApiResponse({ status: 404, description: 'Harvest not found' })
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.harvestsService.remove(id);
  }
}
