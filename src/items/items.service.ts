import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { MongoRepository, Repository } from 'typeorm';
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
    const tickets = await (
      this.ticketsRepository as MongoRepository<Ticket>
    ).find({
      where: {
        'ticket_items.name': {
          $regex: new RegExp(term, 'i'),
        },
        user: username,
      },
    });

    const formattedTickets = tickets
      .map((ticket) => {
        const matchingItem = ticket.ticket_items.find((item) =>
          item.name.toLowerCase().includes(term.toLowerCase()),
        );

        if (matchingItem) {
          return {
            name: matchingItem.name,
            quantity: matchingItem.quantity,
            price: matchingItem.price,
            total: matchingItem.total,
            logo_link: ticket.logo_link,
            date: ticket.date,
            og_ticket_url: ticket.og_ticket_url,
            supermarket: ticket.supermarket,
            ticketId: ticket.id.toString(),
          };
        } else {
          return null;
        }
      })
      .filter(Boolean);

    return formattedTickets;
  }
}
