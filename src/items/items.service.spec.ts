import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemsService } from './items.service';
import { Ticket } from 'src/tickets/entities/ticket.entity';

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

  // describe('searchItems', () => {
  //   it('should return formatted items', async () => {
  //     const mockTickets = [
  //       {
  //         id: 'c755548e-c622-4f09-8446-80af4a4cdf54',
  //         logo_link: 'https://media.easy.com.ar/is/image/EasyArg/logo_disco',
  //         total_amount: 924.72,
  //         ticket_items: [
  //           {
  //             id: 1,
  //             ticket_id: 'c755548e-c622-4f09-8446-80af4a4cdf54',
  //             ticket: new Ticket(),
  //             name: 'Filtro de café JUMBO Home Care N° 2.',
  //             quantity: 1,
  //             price: 1115,
  //             total: 1115,
  //           },
  //           {
  //             id: 2,
  //             ticket_id: 'c755548e-c622-4f09-8446-80af4a4cdf54',
  //             ticket: new Ticket(),
  //             name: 'Pastillas TIC TAC menta',
  //             quantity: 1,
  //             price: 144.22,
  //             total: 144.22,
  //           },
  //         ],
  //         address: 'Intendente Garcia Silva 855',
  //         date: '18/10/2023',
  //         discount: {
  //           disc_items: [
  //             {
  //               desc_name: 'VI_R 30%_Art nonfood JDV',
  //               desc_amount: 334.5,
  //             },
  //           ],
  //           disc_total: 334.5,
  //         },
  //         payment_method: 'Cencosud Mastercard 5281 Cts:01',
  //         og_ticket_url:
  //           'https://mifactura.napse.global/mf/pq1rt7/Y2VuY29zdWRfMTU0XzYwXzZfMDE1NDA2MDAwNjMyMzEwMTgxNDEw',
  //         user: 'username@example.com',
  //         created_at: new Date(),
  //         updated_at: new Date(),
  //         supermarket: 'DISCO',
  //         generateId: () => {},
  //       },
  //     ];

  //     jest.spyOn(ticketsRepository, 'find').mockResolvedValue(mockTickets);

  //     const result = await service.searchItems(
  //       'filtro',
  //       'username@example.com',
  //     );

  //     expect(result).toHaveLength(mockTickets.length);

  //     expect(result[0]).toMatchObject({
  //       name: 'Filtro de café JUMBO Home Care N° 2.',
  //       quantity: 1,
  //       price: 1115,
  //       total: 1115,
  //       logoLink: 'https://media.easy.com.ar/is/image/EasyArg/logo_disco',
  //       date: '18/10/2023',
  //       og_ticket_url:
  //         'https://mifactura.napse.global/mf/pq1rt7/Y2VuY29zdWRfMTU0XzYwXzZfMDE1NDA2MDAwNjMyMzEwMTgxNDEw',
  //       supermarket: 'DISCO',
  //       ticketId: 'c755548e-c622-4f09-8446-80af4a4cdf54',
  //     });
  //   });
  // });
});
