import { Supermarket } from 'src/tickets/dto/create-ticket.dto';
import { Ticket } from 'src/tickets/interfaces/ticket.interface';

export interface SupermarketParser {
  parse(
    htmlString: string,
    og_ticket_url: string,
    supermarket: Supermarket,
  ): Omit<
    Ticket,
    'id' | 'user_email' | 'supermarket' | 'created_at' | 'updated_at'
  >;
}
