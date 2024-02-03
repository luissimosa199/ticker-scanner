import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Repository } from 'typeorm';
import { ItemsSearchResult } from './interfaces/itemsSearchResult';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  async searchItems(
    term: string,
    username: string,
  ): Promise<ItemsSearchResult[]> {
    const tickets = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.ticket_items', 'ticket_item')
      .where('ticket_item.name ILIKE :term', { term: `%${term}%` })
      .andWhere('ticket.user_email = :username', { username: username })
      .orderBy('ticket.date', 'DESC')
      .getMany();

    const formattedTickets = tickets
      .map((ticket) => {
        if (!ticket.ticket_items) {
          return null;
        }

        const matchingItem = ticket.ticket_items.find((item) =>
          item.name.toLowerCase().includes(term.toLowerCase()),
        );

        if (matchingItem) {
          return {
            name: matchingItem.name,
            quantity: Math.round(Number(matchingItem.quantity)),
            price: parseFloat(parseFloat(`${matchingItem.price}`).toFixed(2)),
            total: parseFloat(parseFloat(`${matchingItem.total}`).toFixed(2)),
            logo_link: ticket.logo_link,
            date: ticket.date,
            og_ticket_url: ticket.og_ticket_url,
            supermarket: ticket.supermarket,
            ticketId: ticket.id,
          } as ItemsSearchResult;
        } else {
          return null;
        }
      })
      .filter((item): item is ItemsSearchResult => item !== null);

    return formattedTickets;
  }
}
