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
}
