import { Supermarket } from '../dto/create-ticket.dto';
import { htmlMock } from './htmlMock';

export const sampleDto: {
  og_ticket_url: string;
  supermarket: Supermarket;
  rawTicketHTML: string;
} = {
  og_ticket_url:
    'https://mifactura.napse.global/mf/pq1rt7/Y2VuY29zdWRfMTU0XzVfNl8wMTU0MDA1MDE5OTIzMTAxMTIwMDA=',
  supermarket: 'DISCO' as Supermarket,
  rawTicketHTML: htmlMock,
};
