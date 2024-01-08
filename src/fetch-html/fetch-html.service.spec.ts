import { Test, TestingModule } from '@nestjs/testing';
import { FetchHtmlService } from './fetch-html.service';

describe('FetchHtmlService', () => {
  let service: FetchHtmlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FetchHtmlService],
    }).compile();

    service = module.get<FetchHtmlService>(FetchHtmlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
