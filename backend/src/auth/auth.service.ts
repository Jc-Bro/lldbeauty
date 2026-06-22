import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  ADMIN_AUTH_TOKEN,
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from './auth.constants';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  login(credentials: LoginDto) {
    if (
      credentials.username !== ADMIN_USERNAME ||
      credentials.password !== ADMIN_PASSWORD
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      token: ADMIN_AUTH_TOKEN,
      username: ADMIN_USERNAME,
    };
  }
}
