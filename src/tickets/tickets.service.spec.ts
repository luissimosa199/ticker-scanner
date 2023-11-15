jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  ObjectId: jest.fn().mockImplementation((id) => id),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { DiscoTicketParser } from 'src/utilities/ticket-parser/parsers/disco-ticket-parser.service';
import { TicketParserService } from 'src/utilities/ticket-parser/ticket-parser.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { parsedData } from './mocks/parsedData';
import { sampleDto } from './mocks/sampleDto';
import { TestableTicketsService } from './mocks/TestableTicketsService';

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

    mockRepository.findOne.mockResolvedValueOnce({
      ogTicketUrl: sampleDto.ogTicketUrl,
    });

    try {
      await service.createAndSave(sampleDto, 'test@email.com');
      fail('Expected ConflictException but none was thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ConflictException);
      expect(err.message).toBe('Duplicate ticket');
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
    const user = 'luissimosaarg@gmail.com';
    const tickets = [new Ticket()];

    mockRepository.find.mockResolvedValue(tickets);

    const result = await service.findAll(user);
    expect(result).toEqual(tickets);
  });

  it('should return one ticket for a user (findOne method)', async () => {
    const user = 'luissimosaarg@gmail.com';
    const id = new ObjectId().toHexString();
    const ticket = new Ticket();

    mockRepository.findOne.mockResolvedValue(ticket);

    const result = await service.findOne(id, user);
    expect(result).toEqual(ticket);
  });

  it('should return null when no ticket is found (findOne method)', async () => {
    const user = 'luissimosaarg@gmail.com';
    const id = new ObjectId().toHexString();

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
