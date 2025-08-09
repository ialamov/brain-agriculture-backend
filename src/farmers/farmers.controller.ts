import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FarmersService } from './farmers.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Farmer } from 'src/entities/farmer.entity';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';

@ApiTags('Farmers')
@Controller('farmers')
@UseGuards(AuthGuard('local'))
export class FarmersController {
  constructor(private readonly farmersService: FarmersService) {}

  @ApiOperation({ summary: 'Create a new farmer' })
  @ApiResponse({ status: 201, description: 'Farmer created successfully' })
  @Post()
  async create(@Body() createFarmerDto: CreateFarmerDto): Promise<Farmer> {
    return this.farmersService.create(createFarmerDto);
  }

  @ApiOperation({ summary: 'Get all farmers' })
  @ApiResponse({ status: 200, description: 'List of all farmers' })
  @Get()
  async findAll(): Promise<Farmer[]> {
    return this.farmersService.findAll();
  }

  @ApiOperation({ summary: 'Get farmer by ID' })
  @ApiResponse({ status: 200, description: 'Farmer found' })
  @ApiResponse({ status: 404, description: 'Farmer not found' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Farmer> {
    return this.farmersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update farmer' })
  @ApiResponse({ status: 200, description: 'Farmer updated successfully' })
  @ApiResponse({ status: 404, description: 'Farmer not found' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFarmerDto: UpdateFarmerDto): Promise<Farmer> {
    return this.farmersService.update(id, updateFarmerDto);
  }

  @ApiOperation({ summary: 'Delete farmer' })
  @ApiResponse({ status: 200, description: 'Farmer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Farmer not found' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.farmersService.remove(id);
  }
}
