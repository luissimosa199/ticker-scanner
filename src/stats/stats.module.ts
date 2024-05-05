import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Ticket,
  TicketItem,
  Discount,
} from 'src/tickets/entities/ticket.entity';

@Module({
  controllers: [StatsController],
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    TypeOrmModule.forFeature([TicketItem]),
    TypeOrmModule.forFeature([Discount]),
  ],
  providers: [StatsService],
})
export class StatsModule {}
