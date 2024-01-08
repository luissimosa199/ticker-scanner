import { Supermarket } from 'src/tickets/dto/create-ticket.dto';
import { Ticket } from 'src/tickets/interfaces/ticket.interface';

export interface SupermarketParser {
  parse(
    htmlString: string,
    ogTicketUrl: string,
    supermarket: Supermarket,
  ): Ticket;
}
