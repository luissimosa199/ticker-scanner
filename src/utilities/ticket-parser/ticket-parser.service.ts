import { Injectable } from '@nestjs/common';
import { DiscoTicketParser } from './parsers/disco-ticket-parser.service';
import { Supermarket } from 'src/tickets/dto/create-ticket.dto';
import { Ticket } from 'src/tickets/interfaces/ticket.interface';
import { CotoTicketParser } from './parsers/coto-ticket-parser.service';

@Injectable()
export class TicketParserService {
  constructor(
    private readonly discoParser: DiscoTicketParser,
    private readonly cotoParser: CotoTicketParser,
  ) {}

  parse(
    supermarket: Supermarket,
    htmlString: string,
    og_ticket_url: string,
  ): Omit<
    Ticket,
    'id' | 'user_email' | 'supermarket' | 'created_at' | 'updated_at'
  > {
    switch (supermarket) {
      case 'EASY':
        return this.discoParser.parse(htmlString, og_ticket_url, supermarket);
      case 'DISCO':
        return this.discoParser.parse(htmlString, og_ticket_url, supermarket);
      case 'JUMBO':
        return this.discoParser.parse(htmlString, og_ticket_url, supermarket);
      case 'COTO':
        return this.cotoParser.parse(htmlString, og_ticket_url, supermarket);
      default:
        throw new Error(`Unsupported supermarket: ${supermarket}`);
    }
  }
}
