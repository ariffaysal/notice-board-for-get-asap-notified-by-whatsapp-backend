import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    const systemApiKey = process.env.API_KEY;

    if (!apiKey || apiKey !== systemApiKey) {
      throw new UnauthorizedException('Wrong Secret Key!');
    }
    
    return true;
  }
}