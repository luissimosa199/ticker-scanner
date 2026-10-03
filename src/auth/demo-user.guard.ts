import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

// Demo mode: every request is served as the account in DEMO_USER_EMAIL, no token required.
@Injectable()
export class DemoUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const email = process.env.DEMO_USER_EMAIL;

    if (!email) {
      throw new ServiceUnavailableException('DEMO_USER_EMAIL is not set');
    }

    const request = context.switchToHttp().getRequest();
    request.user = { username: email };
    return true;
  }
}
