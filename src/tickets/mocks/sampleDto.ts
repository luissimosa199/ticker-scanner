import { Supermarket } from '../dto/create-ticket.dto';
import { htmlMock } from './htmlMock';

export const sampleDto: {
  ogTicketUrl: string;
  supermarket: Supermarket;
  rawTicketHTML: string;
} = {
  ogTicketUrl:
    'https://mifactura.napse.global/mf/pq1rt7/Y2VuY29zdWRfMTU0XzVfNl8wMTU0MDA1MDE5OTIzMTAxMTIwMDA=',
  supermarket: 'DISCO' as Supermarket,
  rawTicketHTML: htmlMock,
};
