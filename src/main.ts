import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import { LoggerService } from './common/services/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const loggerService = app.get(LoggerService);

  const globalExceptionFilter = app.get(GlobalExceptionFilter);
  app.useGlobalFilters(globalExceptionFilter);

  const loggingInterceptor = app.get(LoggingInterceptor);
  const performanceInterceptor = app.get(PerformanceInterceptor);
  app.useGlobalInterceptors(loggingInterceptor, performanceInterceptor);

  app.enableCors();

  app.setGlobalPrefix('api/v1');

  const config = new (require('@nestjs/swagger').DocumentBuilder)()
    .setTitle('Brain Agriculture API')
    .setDescription('API for Brain Agriculture')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  loggerService.log(`Application started on port ${port}`, 'Bootstrap');
}
bootstrap();
