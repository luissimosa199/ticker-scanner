import { Controller, Get, Query } from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  async searchItems(@Query('term') term: string) {
    const items = await this.itemsService.searchItems(term);
    return items;
  }
}
