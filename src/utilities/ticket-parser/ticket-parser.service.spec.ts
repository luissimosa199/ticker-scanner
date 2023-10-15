import { Test, TestingModule } from '@nestjs/testing';
import { TicketParserService } from './ticket-parser.service';

describe('TicketParserService', () => {
  let service: TicketParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketParserService],
    }).compile();

    service = module.get<TicketParserService>(TicketParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
