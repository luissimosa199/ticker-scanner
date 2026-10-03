import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ItemsService } from './items.service';
import { DemoUserGuard } from 'src/auth/demo-user.guard';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @UseGuards(DemoUserGuard)
  @Get()
  async searchItems(@Request() req, @Query('term') term: string) {
    const items = await this.itemsService.searchItems(term, req.user.username);
    return items;
  }
}
