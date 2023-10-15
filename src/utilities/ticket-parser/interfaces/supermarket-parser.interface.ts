import { Ticket } from 'src/tickets/interfaces/ticket.interface';

export interface SupermarketParser {
  parse(htmlString: string, ogTicketUrl: string): Ticket;
}
