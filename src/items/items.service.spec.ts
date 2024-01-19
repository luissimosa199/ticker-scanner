import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';

const mockedResult = [
  {
    name: 'Pilas DURACELL aaa',
    quantity: 1,
    price: 2183,
    total: 2183,
    logo_link:
      'https://res.cloudinary.com/ds2ujzebg/image/upload/v1704674554/logo_disco_tzjl49.png',
    date: '2024-01-09T03:00:00.000Z',
    og_ticket_url:
      'https://mifactura.napse.global/mf/pq1rt7/Y2VuY29zdWRfMTU0XzhfNl8wMTU0MDA4MDI1NTI0MDEwOTIwNDA=',
    supermarket: 'DISCO',
    ticketId: 'd790cd88-f586-4c4a-b69d-32478198f4c3',
  },
];

class MockQueryBuilder {
  leftJoinAndSelect = jest.fn().mockReturnThis();
  where = jest.fn().mockReturnThis();
  andWhere = jest.fn().mockReturnThis();
  getMany = jest.fn().mockImplementation(() => mockedResult);
}

describe('ItemsService', () => {
  let service: ItemsService;
  let mockQueryBuilder: MockQueryBuilder;
  let mockTicketsRepository: Partial<Repository<Ticket>>;

  beforeEach(async () => {
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockImplementation(() => mockedResult),
    };

    mockTicketsRepository = {
      createQueryBuilder: jest.fn(() => mockQueryBuilder as any),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: mockTicketsRepository,
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
  });

  it('should return an array of ItemsSearchResult', async () => {
    const term = 'pila';
    const username = 'example@gmail.com';

    const result = await service.searchItems(term, username);

    expect(result).toBeInstanceOf(Array);
    // Add more assertions to validate the structure and content of the result
  });

  // Additional test cases...
});
