import { TicketsService } from '../tickets.service';

export class TestableTicketsService extends TicketsService {
  get testableTicketParser() {
    return this.ticketParser;
  }
}
