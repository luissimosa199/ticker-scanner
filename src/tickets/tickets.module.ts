import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketParserService } from 'src/utilities/ticket-parser/ticket-parser.service';
import { DiscoTicketParser } from 'src/utilities/ticket-parser/parsers/disco-ticket-parser.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';

@Module({
  controllers: [TicketsController],
  imports: [TypeOrmModule.forFeature([Ticket])],
  providers: [DiscoTicketParser, TicketParserService, TicketsService],
})
export class TicketsModule {}
