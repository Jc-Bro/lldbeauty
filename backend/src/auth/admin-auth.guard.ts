import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ADMIN_AUTH_TOKEN } from './auth.constants';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
    const authorization = request.headers.authorization;

    if (authorization === `Bearer ${ADMIN_AUTH_TOKEN}`) {
      return true;
    }

    throw new UnauthorizedException('Admin authentication required');
  }
}
