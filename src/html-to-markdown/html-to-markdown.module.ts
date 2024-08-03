import { Module } from '@nestjs/common';
import { HtmlToMarkdownService } from './html-to-markdown.service';

@Module({
  providers: [HtmlToMarkdownService]
})
export class HtmlToMarkdownModule {}
