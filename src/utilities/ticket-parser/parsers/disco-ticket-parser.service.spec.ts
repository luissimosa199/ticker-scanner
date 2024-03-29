/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { DiscoTicketParser } from './disco-ticket-parser.service';
import { HtmlStructureError } from '../errors/html-structure.error';
import { htmlMock } from 'src/tickets/mocks/htmlMock';
import { parsedData } from 'src/tickets/mocks/parsedData';
import { Supermarket } from 'src/tickets/dto/create-ticket.dto';

describe('DiscoTicketParser', () => {
  let service: DiscoTicketParser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscoTicketParser],
    }).compile();

    service = module.get<DiscoTicketParser>(DiscoTicketParser);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parse', () => {
    // Mocked URL for testing purposes
    const og_ticket_url =
      'https://mifactura.napse.global/mf/pq1rt7/Y2VuY29zdWRfMTU0XzVfNl8wMTU0MDA1MDE5OTIzMTAxMTIwMDA=';

    it('should correctly parse the valid HTML structure', () => {
      const mockValidHtml = htmlMock;

      const result = service.parse(
        mockValidHtml,
        og_ticket_url,
        Supermarket.DISCO,
      );

      expect(result.ticket_items).toBeDefined();
      expect(result.total_amount).toBeDefined();

      const {
        id,
        user_email,
        supermarket,
        created_at,
        updated_at,
        ...mockedParsedData
      } = parsedData;

      expect(result).toEqual(mockedParsedData);
    });

    // TODO: TEST FOT TICKETS WITHOUT DISCOUNTS

    it('should throw HtmlStructureError for invalid HTML structure', () => {
      const mockInvalidHtml = `<p>Invalid HTML</p>`;

      expect(() =>
        service.parse(mockInvalidHtml, og_ticket_url, Supermarket.DISCO),
      ).toThrow(HtmlStructureError);
    });
  });
});
