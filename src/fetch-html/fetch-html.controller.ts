import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { FetchHtmlService } from './fetch-html.service';

@Controller('fetch-html')
export class FetchHtmlController {
  constructor(private fetchHtmlService: FetchHtmlService) {}

  @Get()
  fetchHtml(@Query('url') url: string) {
    try {
      new URL(url);
    } catch (_) {
      throw new BadRequestException('Invalid URL');
    }

    return this.fetchHtmlService.fetchHtml(url);
  }
}
