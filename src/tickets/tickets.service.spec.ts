jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  ObjectId: jest.fn().mockImplementation((id) => id),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { DiscoTicketParser } from 'src/utilities/ticket-parser/parsers/disco-ticket-parser.service';
import { TicketParserService } from 'src/utilities/ticket-parser/ticket-parser.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Discount, Ticket, TicketItem } from './entities/ticket.entity';
import {
  ConflictException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { parsedData } from './mocks/parsedData';
import { sampleDto } from './mocks/sampleDto';
import { TestableTicketsService } from './mocks/TestableTicketsService';
import { CotoTicketParser } from 'src/utilities/ticket-parser/parsers/coto-ticket-parser.service';

describe('TicketsService', () => {
  let service: TestableTicketsService;

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createAndSave: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscoTicketParser,
        CotoTicketParser,
        TicketParserService,
        TestableTicketsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Discount),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(TicketItem),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TestableTicketsService>(TestableTicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should parse and return ticket data (create method)', async () => {
    jest
      .spyOn(service.testableTicketParser, 'parse')
      .mockReturnValue(parsedData);

    expect(service.create(sampleDto)).toEqual(parsedData);
  });

  it('should throw ConflictException if ticket is duplicate', async () => {
    jest
      .spyOn(service.testableTicketParser, 'parse')
      .mockReturnValue(parsedData);

    const ticket = new Ticket();
    mockRepository.create.mockReturnValue(ticket);

    const existingTicket = {
      og_ticket_url: sampleDto.og_ticket_url,
      id: 'existingTicketId',
    };
    mockRepository.findOne.mockResolvedValueOnce(existingTicket);

    try {
      await service.createAndSave(sampleDto, 'test@email.com');
      fail('Expected ConflictException but none was thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ConflictException);
      expect(err.response).toEqual({
        message: JSON.stringify({
          id: 'existingTicketId',
          message: 'Duplicated Ticket',
        }),
      });
    }
  });

  it('should throw ConflictException if ticket is duplicate', async () => {
    const ticket = new Ticket();

    mockRepository.findOne.mockResolvedValueOnce(ticket);

    expect(
      service.createAndSave(sampleDto, 'luissimosaarg@gmail.com'),
    ).rejects.toThrow(ConflictException);
  });

  it('should return all tickets for a user (findAll method)', async () => {
    // Arrange
    const user = 'luissimosaarg@gmail.com';
    const page = 1;
    const limit = 10;
    const tickets = [
      { id: 1, user_email: user, created_at: new Date() },
      // Add more ticket data as needed
    ];
    const ticketItems = [
      {
        id: 1,
        ticket_id: 1,
        name: 'Item 1',
        quantity: 1,
        price: 10,
        total: 10,
      },
    ];
    const discounts = [
      { id: 1, ticket_id: 1, desc_name: 'Discount 1', desc_amount: 5 },
    ];
    const expectedResult = {
      tickets: [
        {
          id: 1,
          user_email: user,
          created_at: expect.any(Date),
          ticket_items: [
            {
              id: 1,
              ticket_id: 1,
              name: 'Item 1',
              quantity: 1,
              price: 10,
              total: 10,
            },
          ],
          discount: {
            disc_items: [
              {
                id: 1,
                ticket_id: 1,
                desc_name: 'Discount 1',
                desc_amount: 5,
              },
            ],
            disc_total: 5,
          },
        },
      ],
      total: 32,
      page,
      limit,
    };

    // Mocking repository responses
    mockRepository.find.mockResolvedValueOnce(tickets);
    mockRepository.find.mockResolvedValueOnce(ticketItems);
    mockRepository.find.mockResolvedValueOnce(discounts);

    // Act
    const result = await service.findAll(user, page, limit);

    // Assert
    expect(result).toEqual(expectedResult);
  });

  it('should return one ticket for a user (findOne method)', async () => {
    const user = 'luissimosaarg@gmail.com';
    const id = 'c755548e-c622-4f09-8446-80af4a4cdf54';
    const ticket = new Ticket();

    mockRepository.findOne.mockResolvedValue(ticket);

    const result = await service.findOne(id, user);
    expect(result).toEqual(ticket);
  });

  it('should return a response with status 204 and message when no tickets are found', async () => {
    const user = 'luissimosaarg@gmail.com';
    const page = 1;
    const limit = 10;
    const expectedResult = {
      message: 'This user has no tickets yet.',
      status: HttpStatus.NO_CONTENT,
    };

    mockRepository.find.mockResolvedValue([]);

    const result = await service.findAll(user, page, limit);

    expect(result).toEqual(expectedResult);
  });

  it('should throw InternalServerErrorException when an error occurs', async () => {
    const user = 'luissimosaarg@gmail.com';
    const page = 1;
    const limit = 10;

    mockRepository.find.mockRejectedValue(new Error('Mocked error'));

    await expect(service.findAll(user, page, limit)).rejects.toThrowError(
      InternalServerErrorException,
    );
  });

  it('should return null when no ticket is found (findOne method)', async () => {
    const user = 'luissimosaarg@gmail.com';
    const id = 'c755548e-c622-4f09-8446-80af4a4cdf54';

    mockRepository.findOne.mockResolvedValue(null);
    const result = await service.findOne(id, user);
    expect(result).toBeNull();
  });

  it('should remove a ticket for a user (remove method)', async () => {
    const user = 'luissimosaarg@gmail.com';
    const id = 'someObjectId';
    const ticket = new Ticket();

    mockRepository.findOne.mockResolvedValue(ticket);
    mockRepository.remove.mockResolvedValue(ticket);

    const result = await service.remove(id, user);
    expect(result).toEqual(ticket);
  });

  it('should throw NotFoundException when trying to remove a non-existent ticket (remove method)', async () => {
    const user = 'luissimosaarg@gmail.com';
    const id = 'someObjectId';

    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.remove(id, user)).rejects.toThrow(NotFoundException);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
