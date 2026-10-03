import { CanActivate, GoneException, Injectable } from '@nestjs/common';

// Blocks endpoints that were retired when the app became a read-only demo.
@Injectable()
export class DeprecatedGuard implements CanActivate {
  canActivate(): boolean {
    throw new GoneException('This feature is deprecated');
  }
}
