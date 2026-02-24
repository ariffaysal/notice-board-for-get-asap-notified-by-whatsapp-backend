import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly SECRET_KEY = '1234567890abcdef'; 

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (apiKey !== this.SECRET_KEY) {
      throw new UnauthorizedException('Wrong Secret Key!');
    }
    return true;
  }
}