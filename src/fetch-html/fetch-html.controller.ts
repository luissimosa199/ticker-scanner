import { Controller, Get, Query } from '@nestjs/common';
import { FetchHtmlService } from './fetch-html.service';

@Controller('fetch-html')
export class FetchHtmlController {
  constructor(private fetchHtmlService: FetchHtmlService) {}

  @Get()
  fetchHtml(@Query('url') url: string) {
    console.log(url)
    return this.fetchHtmlService.fetchHtml(url);
  }
}
