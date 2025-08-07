import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, url, body, params, query, headers } = req;
    const userAgent = headers['user-agent'] || 'Unknown';
    const startTime = Date.now();

    this.loggerService.log(
      `HTTP Request: ${method} ${url}`,
      'HTTP-Middleware'
    );

    const sanitizedBody = this.sanitizeBody(body);
    this.loggerService.debug(
      `Request details: ${JSON.stringify({
        method,
        url,
        body: sanitizedBody,
        params,
        query,
        userAgent,
      })}`,
      'HTTP-Middleware'
    );

    const originalSend = res.send;
    res.send = function(data) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.loggerService.log(
        `HTTP Response: ${method} ${url} - ${res.statusCode} - ${duration}ms`,
        'HTTP-Middleware'
      );

      return originalSend.call(this, data);
    }.bind(this);

    next();
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