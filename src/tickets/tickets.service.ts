import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketParserService } from 'src/utilities/ticket-parser/ticket-parser.service';
import { Ticket } from './entities/ticket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

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
      createTicketDto.ogTicketUrl,
    );

    return { ...parsedData, supermarket: createTicketDto.supermarket };
  }

  async createAndSave(createTicketDto: CreateTicketDto, user: string) {
    const parsedData = this.ticketParser.parse(
      createTicketDto.supermarket,
      createTicketDto.rawTicketHTML,
      createTicketDto.ogTicketUrl,
    );

    const ticket = this.ticketsRepository.create({
      ...parsedData,
      user,
      supermarket: createTicketDto.supermarket,
    });

    const potentialDuplicate = await this.ticketsRepository.findOne({
      where: {
        ogTicketUrl: createTicketDto.ogTicketUrl,
      },
    });

    if (potentialDuplicate) {
      throw new ConflictException('Duplicate ticket');
    }

    return this.ticketsRepository.save(ticket);
  }

  findAll(username: string) {
    const tickets = this.ticketsRepository.find({
      where: {
        user: username,
      },
    });
    return tickets;
  }

  findOne(id: string, user: string) {
    const ticket = this.ticketsRepository.findOne({
      where: {
        _id: new ObjectId(id),
        user: user,
      },
    });

    return ticket;
  }

  async remove(id: string, user: string) {
    const ticket = await this.findOne(id, user);
    if (!ticket) {
      throw new NotFoundException(
        `Ticket #${id} not found or doesn't belong to user`,
      );
    }
    return this.ticketsRepository.remove(ticket);
  }
}
