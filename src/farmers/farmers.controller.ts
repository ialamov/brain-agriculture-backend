import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { FarmersService } from './farmers.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Farmer } from 'src/entities/farmer.entity';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';

@ApiTags('Farmers')
@Controller('farmers')
@UseGuards(AuthGuard('jwt'))
export class FarmersController {
  constructor(private readonly farmersService: FarmersService) {}

  @ApiOperation({ summary: 'Create a new farmer' })
  @ApiResponse({ status: 201, description: 'Farmer created successfully' })
  @ApiBearerAuth()
  @Post()
  async create(@Body() createFarmerDto: CreateFarmerDto): Promise<Farmer> {
    return this.farmersService.create(createFarmerDto);
  }

  @ApiOperation({ summary: 'Get all farmers' })
  @ApiResponse({ status: 200, description: 'List of all farmers' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  @Get()
  async findAll(
    @Query('page') page: number, 
    @Query('pageSize') pageSize: number): Promise<Farmer[]> {
    return this.farmersService.findAll(page, pageSize);
  }

  @ApiOperation({ summary: 'Get farmer by ID' })
  @ApiResponse({ status: 200, description: 'Farmer found' })
  @ApiResponse({ status: 404, description: 'Farmer not found' })
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Farmer> {
    return this.farmersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update farmer' })
  @ApiResponse({ status: 200, description: 'Farmer updated successfully' })
  @ApiResponse({ status: 404, description: 'Farmer not found' })
  @ApiBearerAuth()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFarmerDto: UpdateFarmerDto): Promise<Farmer> {
    return this.farmersService.update(id, updateFarmerDto);
  }

  @ApiOperation({ summary: 'Delete farmer' })
  @ApiResponse({ status: 200, description: 'Farmer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Farmer not found' })
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.farmersService.remove(id);
  }
}
