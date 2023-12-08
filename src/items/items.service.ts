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

  async searchItems(term: string): Promise<ItemsSearchResult[]> {
    const tickets = await (
      this.ticketsRepository as MongoRepository<Ticket>
    ).find({
      where: {
        'ticketItems.name': {
          $regex: new RegExp(term, 'i'),
        },
      },
    });

    const formattedTickets = tickets
      .map((ticket) => {
        const matchingItem = ticket.ticketItems.find((item) =>
          item.name.toLowerCase().includes(term.toLowerCase()),
        );

        if (matchingItem) {
          return {
            name: matchingItem.name,
            quantity: matchingItem.quantity,
            price: matchingItem.price,
            total: matchingItem.total,
            logoLink: ticket.logoLink,
            date: ticket.date,
            ogTicketUrl: ticket.ogTicketUrl,
            supermarket: ticket.supermarket,
            ticketId: ticket._id.toString(),
          };
        } else {
          return null;
        }
      })
      .filter(Boolean);

    return formattedTickets;
  }
}
