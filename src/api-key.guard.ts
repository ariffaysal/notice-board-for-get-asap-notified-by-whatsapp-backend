import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  // THIS IS YOUR SECRET KEY - change it to whatever you want!
  private readonly SECRET_KEY = 'my-super-secret-123'; 

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (apiKey !== this.SECRET_KEY) {
      throw new UnauthorizedException('Wrong Secret Key!');
    }
    return true;
  }
}