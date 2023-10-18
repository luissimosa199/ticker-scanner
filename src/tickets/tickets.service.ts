import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketParserService } from 'src/utilities/ticket-parser/ticket-parser.service';
import { Ticket } from './entities/ticket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketParser: TicketParserService,
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  create(createTicketDto: CreateTicketDto) {
    const parsedData = this.ticketParser.parse(
      createTicketDto.supermarket,
      createTicketDto.rawTicketHTML,
      createTicketDto.ogTicketUrl,
    );

    return parsedData;
  }

  createAndSave(createTicketDto: CreateTicketDto, user: string) {
    const parsedData = this.ticketParser.parse(
      createTicketDto.supermarket,
      createTicketDto.rawTicketHTML,
      createTicketDto.ogTicketUrl,
    );

    const ticket = this.ticketsRepository.create({
      ...parsedData,
      user,
    });

    return this.ticketsRepository.save(ticket);
  }

  findAll() {
    const tickets = this.ticketsRepository.find();
    return tickets;
  }

  findOne(id: string) {
    return `This action returns a #${id} ticket`;
  }

  update(id: string, updateTicketDto: UpdateTicketDto) {
    console.log(updateTicketDto);
    return `This action updates a #${id} ticket`;
  }

  remove(id: string) {
    return `This action removes a #${id} ticket`;
  }
}
