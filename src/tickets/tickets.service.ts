import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketParserService } from 'src/utilities/ticket-parser/ticket-parser.service';
import { Discount, Ticket } from './entities/ticket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class TicketsService {
  constructor(
    protected readonly ticketParser: TicketParserService,
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  create(createTicketDto: CreateTicketDto) {
    const parsedData = this.ticketParser.parse(
      createTicketDto.supermarket,
      createTicketDto.rawTicketHTML,
      createTicketDto.og_ticket_url,
    );

    return { ...parsedData, supermarket: createTicketDto.supermarket };
  }

  async createAndSave(createTicketDto: CreateTicketDto, user_email: string) {
    const parsedData = this.ticketParser.parse(
      createTicketDto.supermarket,
      createTicketDto.rawTicketHTML,
      createTicketDto.og_ticket_url,
    );

    const ticket = this.ticketsRepository.create({
      ...parsedData,
      user_email,
      supermarket: createTicketDto.supermarket,
      discount: parsedData.discount as DeepPartial<Discount>,
    });

    const potentialDuplicate = await this.ticketsRepository.findOne({
      where: {
        og_ticket_url: createTicketDto.og_ticket_url,
      },
    });

    if (potentialDuplicate) {
      throw new ConflictException({
        message: JSON.stringify({
          id: potentialDuplicate.id,
          message: 'Duplicated Ticket',
        }),
      });
    }

    return this.ticketsRepository.save(ticket);
  }

  async findAll(username: string, page: number, limit: number) {
    const [tickets, total] = await this.ticketsRepository.findAndCount({
      where: {
        user_email: username,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        created_at: 'DESC',
      },
    });

    return {
      tickets,
      total,
      page,
      limit,
    };
  }

  findOne(id: string, user_email: string) {
    const ticket = this.ticketsRepository.findOne({
      where: {
        id,
        user_email,
      },
    });

    return ticket;
  }

  async remove(id: string, user_email: string) {
    const ticket = await this.findOne(id, user_email);
    if (!ticket) {
      throw new NotFoundException(
        `Ticket #${id} not found or doesn't belong to user`,
      );
    }
    return this.ticketsRepository.remove(ticket);
  }
}
