import { sampleDto } from './mocks/sampleDto';
import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketParserService } from 'src/utilities/ticket-parser/ticket-parser.service';
import { DiscoTicketParser } from 'src/utilities/ticket-parser/parsers/disco-ticket-parser.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './tickets.service';
import { ObjectId } from 'mongodb';
import { NotFoundException } from '@nestjs/common';

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: any;

  const mockCreate = jest.fn();
  const mockFindAll = jest.fn();
  const mockGetProfile = jest.fn();
  const mockfindOne = jest.fn();
  const mockremove = jest.fn();
  const mockCreateAndSave = jest.fn();

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      createAndSave: jest.fn(),
      remove: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        DiscoTicketParser,
        TicketParserService,
        {
          provide: TicketsService,
          useValue: {
            create: mockCreate,
            findAll: mockFindAll,
            getProfile: mockGetProfile,
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a ticket (create method)', async () => {
    service.create.mockReturnValue(sampleDto);

    expect(await controller.create(sampleDto)).toEqual(sampleDto);
  });

  it('should create and save a ticket (createAndSave method)', async () => {
    const user = 'test@example.com';

    service.createAndSave.mockReturnValue(sampleDto);

    expect(
      await controller.createAndSave({ user: { username: user } }, sampleDto),
    ).toEqual(sampleDto);
  });

  it('should find all tickets for a user (findAll method)', async () => {
    const tickets = [sampleDto, sampleDto];
    const user = 'test@example.com';
    service.findAll.mockReturnValue(tickets);
    expect(await controller.findAll({ user: { username: user } })).toEqual(
      tickets,
    );
  });

  it('should find all tickets for a user (findOne method)', async () => {
    const username = 'luissimosaarg@gmail.com';
    const id = new ObjectId().toHexString();
    const ticket = new Ticket();

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
    const ticket = new Ticket();

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
