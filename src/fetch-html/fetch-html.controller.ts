import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FetchHtmlService } from './fetch-html.service';
import { DeprecatedGuard } from 'src/global/guards/deprecated.guard';

@Controller('fetch-html')
export class FetchHtmlController {
  constructor(private fetchHtmlService: FetchHtmlService) {}

  @UseGuards(DeprecatedGuard)
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
