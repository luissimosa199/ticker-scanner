import { Injectable } from '@nestjs/common';
import * as TurndownService from 'turndown';
import * as cheerio from 'cheerio';

@Injectable()
export class HtmlToMarkdownService {
  private turndownService: TurndownService;

  constructor() {
    this.turndownService = new TurndownService();
  }

  convertHtmlToMarkdown(html: string): string {
    const cleanedHtml = this.cleanHtml(html);
    const result = this.turndownService.turndown(cleanedHtml);
    return result;
  }

  cleanHtml(html: string): string {
    const $ = cheerio.load(html);
    // Remove <script> and <style> tags
    $('script').remove();
    $('style').remove();
    return $.html();
  }
}
