import { Test, TestingModule } from '@nestjs/testing';
import { DiscoTicketParser } from './disco-ticket-parser.service';
import * as fs from 'fs';
import { expectedTicketMock } from './expectedTicketMock';

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

  it('should parse HTML and return a Ticket object', () => {
    const htmlString = fs.readFileSync('./htmlMock.html', 'utf8');

    const ogTicketUrl = 'https://example.com/ticket';
    const ticket = service.parse(htmlString, ogTicketUrl);

    const expectedTicket = expectedTicketMock;

    expect(ticket).toEqual(expectedTicket);
  });
});
