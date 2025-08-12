import { Controller, Get, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('metrics')
@ApiTags('Metrics')
@UseGuards(AuthGuard('jwt'))
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @ApiOperation({ summary: 'Get metrics summary of all registered' })
  @ApiResponse({ status: 200, description: 'Metrics summary of all registered' })
  @ApiBearerAuth()
  @Get('/summary')
  async getMetricsSummary(): Promise<any> {
    return this.metricsService.getMetricsSummary();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all unique harvest years and crops names' })
  @ApiResponse({ status: 200, description: 'Unique years and crops names' })
  @ApiResponse({ status: 404, description: 'No unique years and/or crops names found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get('/unique-years-and-crops')
  async getUniqueYearsAndCrops(): Promise<any> {
    return this.metricsService.getUniqueYearsAndCrops();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Total area registered' })
  @ApiResponse({ status: 200, description: 'Total area registered' })
  @ApiResponse({ status: 404, description: 'There is no area registered' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get('/total-area-registered')
  async getTotalAreaRegistered(): Promise<any> {
    return this.metricsService.getTotalAreaRegistered();
  }
}
