import { ConfigService } from '@nestjs/config';

export const jwtConstants = {
  secret: (configService: ConfigService) => configService.get<string>('SECRET'),
};
