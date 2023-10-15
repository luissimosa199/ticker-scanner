import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketParserService } from 'src/utilities/ticket-parser/ticket-parser.service';

@Injectable()
export class TicketsService {
  constructor(private readonly ticketParser: TicketParserService) {}

  create(createTicketDto: CreateTicketDto) {
    const parsedData = this.ticketParser.parse(
      createTicketDto.supermarket,
      createTicketDto.rawTicketHTML,
      createTicketDto.ogTicketUrl,
    );

    return parsedData;
  }

  findAll() {
    return `This action returns all tickets`;
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
