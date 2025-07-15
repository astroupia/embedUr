import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Check for API key in headers
    const apiKey = request.headers['x-api-key'] || request.headers['authorization'];
    const expectedApiKey = process.env.ENRICHMENT_WEBHOOK_API_KEY;
    
    this.logger.log(`API Key check: provided=${apiKey}, expected=${expectedApiKey}`);
    
    if (!expectedApiKey) {
      // If no API key is configured, allow all requests (for development)
      this.logger.log('No API key configured, allowing request');
      return true;
    }
    
    if (!apiKey || apiKey !== expectedApiKey) {
      this.logger.warn(`Invalid API key: provided=${apiKey}, expected=${expectedApiKey}`);
      throw new UnauthorizedException('Invalid API key for webhook');
    }
    
    this.logger.log('API key validation successful');
    return true;
  }
} 