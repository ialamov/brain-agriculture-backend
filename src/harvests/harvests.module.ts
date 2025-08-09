import { Module } from '@nestjs/common';
import { HarvestsService } from './harvests.service';
import { HarvestsController } from './harvests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Harvest } from '../entities/harvest.entity';
import { LoggerService } from '../common/services/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Harvest])],
  controllers: [HarvestsController],
  providers: [HarvestsService, LoggerService],
})
export class HarvestsModule {}
