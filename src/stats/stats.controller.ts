import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { DemoUserGuard } from 'src/auth/demo-user.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(DemoUserGuard)
  @Get('mainStats')
  getMainStats(@Request() req) {
    return this.statsService.getMainStats(req.user.username);
  }

  @UseGuards(DemoUserGuard)
  @Get(':stat')
  getSpecificStat(@Request() req, @Param('stat') stat: string) {
    return this.statsService.getSpecificStat(req.user.username, stat);
  }
}
