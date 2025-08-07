import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const userAgent = request.get('User-Agent') || 'Unknown';
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Log all requests
        this.loggerService.log(
          `Performance: ${method} ${url} - ${duration}ms - ${userAgent}`,
          'Performance-Interceptor'
        );
        
        // Log slow requests (> 1 second)
        if (duration > 1000) {
          this.loggerService.warn(
            `Slow Request: ${method} ${url} took ${duration}ms`,
            'Performance-Interceptor'
          );
        }
        
        // Log very slow requests (> 5 seconds)
        if (duration > 5000) {
          this.loggerService.error(
            `Very Slow Request: ${method} ${url} took ${duration}ms`,
            undefined,
            'Performance-Interceptor'
          );
        }
      })
    );
  }
} 