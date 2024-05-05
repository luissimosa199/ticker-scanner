import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('mainStats')
  getMainStats(@Request() req) {
    return this.statsService.getMainStats(req.user.username);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':stat')
  getSpecificStat(@Request() req, @Param('stat') stat: string) {
    return this.statsService.getSpecificStat(req.user.username, stat);
  }
}
