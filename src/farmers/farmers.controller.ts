import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FarmersService } from './farmers.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Farmer } from 'src/entities/farmer.entity';
import { CreateFarmerDto } from './dto/create-farmer.dto';

@ApiTags('Farmers')
@Controller('farmer')
@UseGuards(AuthGuard('local'))
export class FarmersController {
  constructor(private readonly farmersService: FarmersService) {}

  @ApiOperation({ summary: 'Create a new farmer' })
  @ApiResponse({ status: 201, description: 'Farmer created successfully' })
  @Post()
  async create(@Body() createFarmerDto: CreateFarmerDto): Promise<Farmer> {
    return this.farmersService.create(createFarmerDto);
  }
}
