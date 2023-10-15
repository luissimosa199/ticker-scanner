import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketParserService } from 'src/utilities/ticket-parser/ticket-parser.service';
import { DiscoTicketParser } from 'src/utilities/ticket-parser/parsers/disco-ticket-parser.service';

@Module({
  controllers: [TicketsController],
  providers: [DiscoTicketParser, TicketParserService, TicketsService],
})
export class TicketsModule {}
