import { Test, TestingModule } from '@nestjs/testing';
import { TicketParserService } from './ticket-parser.service';
import { DiscoTicketParser } from './parsers/disco-ticket-parser.service';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Supermarket } from 'src/tickets/dto/create-ticket.dto';
import { parsedData } from 'src/tickets/mocks/parsedData';
import { ObjectId } from 'mongodb';
import { CotoTicketParser } from './parsers/coto-ticket-parser.service';

describe('TicketParserService', () => {
  let service: TicketParserService;
  let discoParser: jest.Mocked<DiscoTicketParser>;
  let cotoParser: jest.Mocked<CotoTicketParser>;

  beforeEach(async () => {
    const discoParserMock = {
      parse: jest.fn(),
    };

    const cotoParserMock = {
      parse: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketParserService,
        { provide: DiscoTicketParser, useValue: discoParserMock },
        { provide: CotoTicketParser, useValue: cotoParserMock },
      ],
    }).compile();

    service = module.get<TicketParserService>(TicketParserService);
    discoParser = module.get(DiscoTicketParser);
    cotoParser = module.get(CotoTicketParser);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should use DiscoTicketParser for DISCO supermarket', () => {
    const mockedTicket: Ticket = {
      ...parsedData,
      id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    discoParser.parse.mockReturnValue(mockedTicket);

    const result = service.parse(
      Supermarket.DISCO,
      'htmlString',
      'ogTicketUrl',
    );
    expect(result).toEqual(mockedTicket);
    expect(discoParser.parse).toHaveBeenCalledWith(
      'htmlString',
      'ogTicketUrl',
      'DISCO',
    );
  });

  it('should throw an error for unsupported supermarket', () => {
    expect(() => {
      service.parse('UNSUPPORTED' as any, 'htmlString', 'ogTicketUrl');
    }).toThrowError('Unsupported supermarket: UNSUPPORTED');
  });
});
