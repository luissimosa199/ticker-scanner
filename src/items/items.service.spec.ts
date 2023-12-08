import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemsService } from './items.service';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { ObjectId } from 'mongodb';

describe('ItemsService', () => {
  let service: ItemsService;
  let ticketsRepository: Repository<Ticket>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: getRepositoryToken(Ticket),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    ticketsRepository = module.get<Repository<Ticket>>(
      getRepositoryToken(Ticket),
    );
  });

  describe('searchItems', () => {
    it('should return formatted items', async () => {
      const mockedId = new ObjectId('65732ad0d0a55e7c2d6dc761');

      const mockTickets = [
        {
          _id: mockedId,
          logoLink: 'https://media.easy.com.ar/is/image/EasyArg/logo_disco',
          totalAmount: 924.72,
          ticketItems: [
            {
              name: 'Filtro de café JUMBO Home Care N° 2.',
              quantity: 1,
              price: 1115,
              total: 1115,
            },
            {
              name: 'Pastillas TIC TAC menta',
              quantity: 1,
              price: 144.22,
              total: 144.22,
            },
          ],
          address: 'Intendente Garcia Silva 855',
          date: '18/10/2023',
          discounts: {
            disc_items: [
              {
                desc_name: 'VI_R 30%_Art nonfood JDV',
                desc_amount: 334.5,
              },
            ],
            disc_total: 334.5,
          },
          paymentMethod: 'Cencosud Mastercard 5281 Cts:01',
          ogTicketUrl:
            'https://mifactura.napse.global/mf/pq1rt7/Y2VuY29zdWRfMTU0XzYwXzZfMDE1NDA2MDAwNjMyMzEwMTgxNDEw',
          user: 'username@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          supermarket: 'DISCO',
        },
      ];

      jest.spyOn(ticketsRepository, 'find').mockResolvedValue(mockTickets);

      const result = await service.searchItems(
        'filtro',
        'username@example.com',
      );

      expect(result).toHaveLength(mockTickets.length);

      expect(result[0]).toMatchObject({
        name: 'Filtro de café JUMBO Home Care N° 2.',
        quantity: 1,
        price: 1115,
        total: 1115,
        logoLink: 'https://media.easy.com.ar/is/image/EasyArg/logo_disco',
        date: '18/10/2023',
        ogTicketUrl:
          'https://mifactura.napse.global/mf/pq1rt7/Y2VuY29zdWRfMTU0XzYwXzZfMDE1NDA2MDAwNjMyMzEwMTgxNDEw',
        supermarket: 'DISCO',
        ticketId: mockedId.toString(),
      });
    });
  });
});
