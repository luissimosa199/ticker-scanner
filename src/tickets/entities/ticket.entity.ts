import { TicketItem } from '../interfaces/ticket.interface';

export class Ticket {
  logoLink: string;
  totalAmount: number;
  ticketItems: TicketItem[];
  address: string;
  date: string;
}
