import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, params, query, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const startTime = Date.now();
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const methodName = `${controller}.${handler}`;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.loggerService.log(
      `Request started: ${method} ${url} (${methodName})`,
      `Request-${requestId}`
    );

    const sanitizedBody = this.sanitizeBody(body);
    this.loggerService.debug(
      `Request details: ${JSON.stringify({
        method,
        url,
        controller,
        handler,
        body: sanitizedBody,
        params,
        query,
        userAgent,
        requestId,
      })}`,
      `Request-${requestId}`
    );

    return next.handle().pipe(
      tap((data) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.loggerService.log(
          `Request completed: ${method} ${url} (${methodName}) - ${response.statusCode} - ${duration}ms`,
          `Request-${requestId}`
        );

        const responseData = JSON.stringify(data);
        if (responseData.length > 1000) {
          this.loggerService.debug(
            `Response data (truncated): ${responseData.substring(0, 1000)}...`,
            `Request-${requestId}`
          );
        } else {
          this.loggerService.debug(
            `Response data: ${responseData}`,
            `Request-${requestId}`
          );
        }

        if (duration > 1000) {
          this.loggerService.warn(
            `Slow request detected: ${method} ${url} (${methodName}) took ${duration}ms`,
            `Request-${requestId}`
          );
        }

        if (duration > 5000) {
          this.loggerService.error(
            `Very slow request: ${method} ${url} (${methodName}) took ${duration}ms`,
            undefined,
            `Request-${requestId}`
          );
        }
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Log error response with method information
        this.loggerService.error(
          `Request failed: ${method} ${url} (${methodName}) - ${duration}ms - ${error.message}`,
          error.stack,
          `Request-${requestId}`
        );

        throw error;
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...body };

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
} 