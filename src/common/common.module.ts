import { Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

@Module({
  providers: [
    LoggerService,
    LoggerMiddleware,
    LoggingInterceptor,
    PerformanceInterceptor,
    GlobalExceptionFilter,
  ],
  exports: [
    LoggerService,
    LoggerMiddleware,
    LoggingInterceptor,
    PerformanceInterceptor,
    GlobalExceptionFilter,
  ],
})
export class CommonModule {}
