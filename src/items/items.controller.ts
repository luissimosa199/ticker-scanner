import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async searchItems(@Request() req, @Query('term') term: string) {
    const items = await this.itemsService.searchItems(term, req.user.username);
    return items;
  }
}
