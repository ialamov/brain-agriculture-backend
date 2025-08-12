import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Farm } from 'src/entities/farm.entity';
import { Harvest } from 'src/entities/harvest.entity';
import { Crop } from 'src/entities/crop.entity';
import { Farmer } from 'src/entities/farmer.entity';
import { LoggerService } from '../common/services/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Farm, Harvest, Crop, Farmer])],
  controllers: [MetricsController],
  providers: [MetricsService, LoggerService],
})
export class MetricsModule {}
