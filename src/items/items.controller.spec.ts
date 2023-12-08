import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';

describe('ItemsController', () => {
  let controller: ItemsController;
  let itemsService: ItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        ItemsService,
        {
          provide: getRepositoryToken(Ticket),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    itemsService = module.get<ItemsService>(ItemsService);
  });

  describe('searchItems', () => {
    it('should return items from the service', async () => {
      const mockItems = [];

      const mockedRequest = {
        user: { username: 'username@example.com' },
      };

      jest.spyOn(itemsService, 'searchItems').mockResolvedValue(mockItems);

      const result = await controller.searchItems(
        mockedRequest,
        'your-search-term',
      );

      expect(result).toEqual(mockItems);
    });
  });
});
