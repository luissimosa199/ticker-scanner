import { Test, TestingModule } from '@nestjs/testing';
import { HtmlToMarkdownService } from './html-to-markdown.service';

describe('HtmlToMarkdownService', () => {
  let service: HtmlToMarkdownService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HtmlToMarkdownService],
    }).compile();

    service = module.get<HtmlToMarkdownService>(HtmlToMarkdownService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
