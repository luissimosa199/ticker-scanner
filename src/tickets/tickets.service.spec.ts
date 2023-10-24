import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { DiscoTicketParser } from 'src/utilities/ticket-parser/parsers/disco-ticket-parser.service';
import { TicketParserService } from 'src/utilities/ticket-parser/ticket-parser.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import * as fs from 'fs';
import * as path from 'path';
import { Supermarket } from './dto/create-ticket.dto';

class TestableTicketsService extends TicketsService {
  get testableTicketParser() {
    return this.ticketParser;
  }
}

describe('TicketsService', () => {
  let service: TestableTicketsService;

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    createAndSave: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscoTicketParser,
        TicketParserService,
        TestableTicketsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TestableTicketsService>(TestableTicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const htmlMock = fs.readFileSync(
    path.join(__dirname, '../utilities/ticket-parser/parsers/htmlMock.html'),
    'utf-8',
  );

  it('should parse and return ticket data', async () => {
    const sampleDto: {
      ogTicketUrl: string;
      supermarket: Supermarket;
      rawTicketHTML: string;
    } = {
      ogTicketUrl:
        'https://mifactura.napse.global/mf/pq1rt7/Y2VuY29zdWRfMTU0XzVfNl8wMTU0MDA1MDE5OTIzMTAxMTIwMDA=',
      supermarket: 'DISCO' as Supermarket,
      rawTicketHTML: htmlMock,
    };

    const parsedData = {
      _id: {
        $oid: '652dc2fb6ba1fade28ef8416',
      },
      logoLink: 'https://media.easy.com.ar/is/image/EasyArg/logo_disco',
      totalAmount: 16049.03,
      ticketItems: [
        {
          name: 'Chocolate MILKA Milk',
          quantity: 1,
          price: 126.3,
          total: 126.3,
        },
        {
          name: 'cerveza PATAGONIA Amber Lager 1lt Ret.',
          quantity: 2,
          price: 983.85,
          total: 1967.7,
        },
        {
          name: 'Carre de cerdo con hueso x kg',
          quantity: 0.464,
          price: 2275,
          total: 1055.6,
        },
        {
          name: 'Carre de cerdo con hueso x kg',
          quantity: 0.416,
          price: 2275,
          total: 946.4,
        },
        {
          name: 'envase QUILMES',
          quantity: 2,
          price: 240.38,
          total: 480.76,
        },
        {
          name: 'NALGA X KG',
          quantity: 0.767,
          price: 1947,
          total: 1493.35,
        },
        {
          name: 'Milanesa de cerdo x kg',
          quantity: 0.778,
          price: 3645,
          total: 2835.81,
        },
        {
          name: 'CARNE PICADA ESPECIAL ENVASADA AL VACIO',
          quantity: 0.584,
          price: 1899,
          total: 1109.02,
        },
        {
          name: 'CARNE PICADA ESPECIAL ENVASADA AL VACIO',
          quantity: 0.529,
          price: 1899,
          total: 1004.57,
        },
        {
          name: 'Salchicha Patyviena x 12 un',
          quantity: 1,
          price: 846.42,
          total: 846.42,
        },
        {
          name: 'Pechuga de pollo EP x kg',
          quantity: 0.978,
          price: 2385,
          total: 2332.53,
        },
        {
          name: 'Pechuga de pollo EP x kg',
          quantity: 1.06,
          price: 2385,
          total: 2528.1,
        },
      ],
      address: 'Intendente Garcia Silva 855',
      date: '11/10/2023',
      discounts: {
        disc_items: [
          {
            desc_name: 'OI_10%_PATAGONIA 1 Litros',
            desc_amount: 196.77,
          },
          {
            desc_name: 'Retorno Envases',
            desc_amount: 480.76,
          },
        ],
        disc_total: 677.53,
      },
      paymentMethod: 'Naranja 2497 Cts:11',
      ogTicketUrl:
        'https://mifactura.napse.global/mf/pq1rt7/Y2VuY29zdWRfMTU0XzVfNl8wMTU0MDA1MDE5OTIzMTAxMTIwMDA=',
      user: 'luissimosaarg@gmail.com',
      createdAt: {
        $date: '2023-10-16T23:10:51.557Z',
      },
      updatedAt: {
        $date: '2023-10-16T23:10:51.557Z',
      },
    };

    jest
      .spyOn(service.testableTicketParser, 'parse')
      .mockReturnValue(parsedData);

    expect(service.create(sampleDto)).toBe(parsedData);
  });

  // TODO: TEST FOR:
  // findAll,
  // findOne,
  // createAndSave,
  // remove,
});
