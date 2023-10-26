import { Test, TestingModule } from '@nestjs/testing';
import { DiscoTicketParser } from './disco-ticket-parser.service';

describe('DiscoTicketParser', () => {
  let service: DiscoTicketParser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscoTicketParser],
    }).compile();

    service = module.get<DiscoTicketParser>(DiscoTicketParser);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
