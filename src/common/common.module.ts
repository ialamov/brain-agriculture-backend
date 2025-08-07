import { Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Module({
  providers: [
    LoggerService,
    LoggerMiddleware,
  ],
  exports: [
    LoggerService,
    LoggerMiddleware,
  ],
})
export class CommonModule {}
