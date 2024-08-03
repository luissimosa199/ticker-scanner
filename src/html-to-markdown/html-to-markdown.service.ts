import { Injectable } from '@nestjs/common';
import TurndownService from 'turndown';

@Injectable()
export class HtmlToMarkdownService {
  private turndownService: TurndownService;

  constructor() {
    this.turndownService = new TurndownService();
  }

  convertHtmlToMarkdown(html: string): string {
    return this.turndownService.turndown(html);
  }
}