import { Injectable } from '@nestjs/common';
import { DiscoTicketParser } from './parsers/disco-ticket-parser.service';
import { Supermarket } from 'src/tickets/dto/create-ticket.dto';
import { Ticket } from 'src/tickets/interfaces/ticket.interface';

@Injectable()
export class TicketParserService {
  constructor(private readonly discoParser: DiscoTicketParser) {}

  parse(
    supermarket: Supermarket,
    htmlString: string,
    ogTicketUrl: string,
  ): Ticket {
    console.log({
      supermarket,
    });
    switch (supermarket) {
      case 'EASY':
        return this.discoParser.parse(htmlString, ogTicketUrl);
      case 'DISCO':
        return this.discoParser.parse(htmlString, ogTicketUrl);
      case 'JUMBO':
        return this.discoParser.parse(htmlString, ogTicketUrl);
      // case Supermarket.COTO:
      //     return this.cotoParser.parse(htmlString);
      default:
        throw new Error(`Unsupported supermarket: ${supermarket}`);
    }
  }
}
