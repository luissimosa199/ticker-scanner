import { parsedData } from './mocks/parsedData';
import { sampleDto } from './mocks/sampleDto';
import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketParserService } from 'src/utilities/ticket-parser/ticket-parser.service';
import { DiscoTicketParser } from 'src/utilities/ticket-parser/parsers/disco-ticket-parser.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './tickets.service';
import { ObjectId } from 'mongodb';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CotoTicketParser } from 'src/utilities/ticket-parser/parsers/coto-ticket-parser.service';

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: any;

  const mockCreate: jest.Mock<Ticket, [CreateTicketDto]> = jest.fn();
  const mockCreateAndSave: jest.Mock<
    Promise<Ticket>,
    [any, CreateTicketDto]
  > = jest.fn();
  const mockFindAll: jest.Mock<Promise<Ticket[]>> = jest.fn();
  const mockfindOne: jest.Mock<Promise<Ticket>, [string]> = jest.fn();
  const mockremove: jest.Mock<Promise<Ticket>, [string]> = jest.fn();

  beforeEach(async () => {
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

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        DiscoTicketParser,
        TicketParserService,
        CotoTicketParser,
        {
          provide: TicketsService,
          useValue: {
            create: mockCreate,
            findAll: mockFindAll,
            findOne: mockfindOne,
            remove: mockremove,
            createAndSave: mockCreateAndSave,
          },
        },
        {
          provide: getRepositoryToken(Ticket),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get<TicketsService>(TicketsService);
  });

  const mockedTicket: Ticket = {
    ...parsedData,
    _id: new ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a ticket (create method)', async () => {
    service.create.mockReturnValue(mockedTicket);

    expect(controller.create(sampleDto)).toEqual(mockedTicket);
  });

  it('should create and save a ticket (createAndSave method)', async () => {
    const user = 'test@example.com';
    service.createAndSave.mockReturnValue(mockedTicket);
    expect(
      await controller.createAndSave({ user: { username: user } }, sampleDto),
    ).toEqual(mockedTicket);
  });

  it('should throw ConflictException if ticket is duplicate', async () => {
    const user = 'test@example.com';

    jest
      .spyOn(service, 'createAndSave')
      .mockRejectedValue(new ConflictException('Duplicate ticket'));

    await expect(
      controller.createAndSave({ user: { username: user } }, sampleDto),
    ).rejects.toThrow(ConflictException);
  });

  it('should find all tickets for a user (findAll method)', async () => {
    const tickets = [mockedTicket, mockedTicket];
    const user = 'test@example.com';
    const total = tickets.length;

    // Adjust the mock to return an object instead of an array
    service.findAll.mockResolvedValue({ tickets, total, page: 1, limit: 10 });

    // Destructure the object returned by service.findAll
    const {
      tickets: resultTickets,
      total: resultTotal,
      page,
      limit,
    } = await controller.findAll({ user: { username: user }, query: {} });

    expect(resultTickets).toEqual(tickets);
    expect(resultTotal).toEqual(total);
    expect(page).toEqual(1);
    expect(limit).toEqual(10);
  });

  it('should find all tickets for a user (findOne method)', async () => {
    const username = 'luissimosaarg@gmail.com';
    const id = new ObjectId().toHexString();
    const ticket = {
      ...mockedTicket,
      _id: id,
    };

    service.findOne.mockReturnValue(ticket);
    expect(await controller.findOne({ user: { username } }, id)).toEqual(
      ticket,
    );
  });

  it('should return null when no ticket is found (findOne method)', async () => {
    const username = 'luissimosaarg@gmail.com';
    const id = new ObjectId().toHexString();

    service.findOne.mockResolvedValue(null);
    expect(await controller.findOne({ user: { username } }, id)).toBeNull();
  });

  // remove
  it('should remove a ticket for a user (remove method)', async () => {
    const username = 'luissimosaarg@gmail.com';
    const id = 'someObjectId';
    const ticket = {
      ...mockedTicket,
      _id: id,
    };

    service.remove.mockResolvedValue(ticket);
    expect(await controller.remove({ user: { username } }, id)).toEqual(ticket);
  });

  it('should throw NotFoundException when trying to remove a non-existent ticket (remove method)', async () => {
    const user = 'luissimosaarg@gmail.com';
    const id = 'someObjectId';

    service.remove.mockRejectedValue(new NotFoundException());
    await expect(service.remove(id, user)).rejects.toThrow(NotFoundException);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
