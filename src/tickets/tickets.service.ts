import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketParserService } from 'src/utilities/ticket-parser/ticket-parser.service';
import { Discount, Ticket, TicketItem } from './entities/ticket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class TicketsService {
  constructor(
    protected readonly ticketParser: TicketParserService,
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(TicketItem)
    private ticketItemRepository: Repository<TicketItem>,
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
  ) {}

  create(createTicketDto: CreateTicketDto) {
    const parsedData = this.ticketParser.parse(
      createTicketDto.supermarket,
      createTicketDto.rawTicketHTML,
      createTicketDto.og_ticket_url,
    );

    return { ...parsedData, supermarket: createTicketDto.supermarket };
  }

  async createAndSave(createTicketDto: CreateTicketDto, user_email: string) {
    const parsedData = this.ticketParser.parse(
      createTicketDto.supermarket,
      createTicketDto.rawTicketHTML,
      createTicketDto.og_ticket_url,
    );

    const potentialDuplicate = await this.ticketsRepository.findOne({
      where: {
        og_ticket_url: createTicketDto.og_ticket_url,
      },
    });

    if (potentialDuplicate) {
      throw new ConflictException({
        message: JSON.stringify({
          id: potentialDuplicate.id,
          message: 'Duplicated Ticket',
        }),
      });
    }

    const ticket = this.ticketsRepository.create({
      ...parsedData,
      user_email,
      supermarket: createTicketDto.supermarket,
      discount: parsedData.discount as DeepPartial<Discount>,
    });

    try {
      const savedTicket = await this.createTicketAndRelatedData(
        ticket,
        parsedData.discount,
      );

      return { ...savedTicket, discount: parsedData.discount };
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(username: string, page: number, limit: number) {
    try {
      const [rawTicket, totalCount] = await this.ticketsRepository.findAndCount(
        {
          where: {
            user_email: username,
          },
          order: {
            created_at: 'DESC',
          },
          skip: (page - 1) * limit,
          take: limit,
        },
      );

      if (!rawTicket || rawTicket.length === 0) {
        if (!rawTicket || rawTicket.length === 0) {
          return {
            message: 'This user has no tickets yet.',
            status: HttpStatus.NO_CONTENT,
          };
        }
      }

      const ticketItemPromises = rawTicket.map(async (ticket) => {
        const ticketItems = await this.ticketItemRepository.find({
          where: {
            ticket_id: ticket.id,
          },
          select: ['id', 'name', 'quantity', 'price', 'total'],
        });

        const ticketItemsAsNumbers = ticketItems.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          price: parseFloat(parseFloat(`${item.price}`).toFixed(2)),
          total: parseFloat(parseFloat(`${item.total}`).toFixed(2)),
        }));

        return {
          ...ticket,
          ticket_items: ticketItemsAsNumbers,
        };
      });

      const discountPromises = rawTicket.map(async (ticket) => {
        const discount = await this.discountRepository.find({
          where: {
            ticket_id: ticket.id,
          },
          select: ['id', 'desc_name', 'desc_amount'],
        });

        const discountAsNumbers = discount.map((item) => ({
          ...item,
          desc_amount: parseFloat(parseFloat(`${item.desc_amount}`).toFixed(2)),
        }));

        return {
          ...ticket,
          discount: discountAsNumbers || [],
        };
      });

      const ticketItemsAndDiscounts = await Promise.all([
        Promise.all(ticketItemPromises),
        Promise.all(discountPromises),
      ]);

      const tickets = ticketItemsAndDiscounts[0].map((ticket) => {
        const correspondingDiscount = ticketItemsAndDiscounts[1].find(
          (discount) => discount.id === ticket.id,
        );

        const finalTicket = {
          ...ticket,
          discount: {
            desc_items: correspondingDiscount
              ? correspondingDiscount.discount
              : [],
            desc_total: correspondingDiscount
              ? correspondingDiscount.discount.reduce(
                  (sum, discount) => sum + Number(discount.desc_amount),
                  0,
                )
              : 0,
          },
        };

        return finalTicket;
      });

      return {
        tickets,
        total: totalCount,
        page,
        limit,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving tickets.');
    }
  }

  findOne(id: string, user_email: string) {
    const ticket = this.ticketsRepository.findOne({
      where: {
        id,
        user_email,
      },
    });

    return ticket;
  }

  async remove(id: string, user_email: string) {
    const ticket = await this.findOne(id, user_email);
    if (!ticket) {
      throw new NotFoundException(
        `Ticket #${id} not found or doesn't belong to user`,
      );
    }
    return this.ticketsRepository.remove(ticket);
  }

  async createTicketAndRelatedData(
    ticketData: Ticket,
    discount: { disc_items: { desc_name: string; desc_amount: number }[] },
  ) {
    const date = new Date().toISOString();
    const ticket = this.ticketsRepository.create({
      ...ticketData,
      created_at: date,
      updated_at: date,
    });
    const savedTicket = await this.ticketsRepository.save(ticket);

    for (const item of ticketData.ticket_items) {
      const ticketItem = this.ticketItemRepository.create({
        ...item,
        ticket: savedTicket,
      });
      await this.ticketItemRepository.save(ticketItem);
    }

    let savedDiscounts;

    if (discount) {
      savedDiscounts = await this.saveDiscountItems(
        savedTicket.id,
        discount.disc_items,
      );
    }

    return { ...savedTicket, discount: savedDiscounts };
  }

  private async saveDiscountItems(ticketId: string, discItems: any) {
    const savedDiscounts = [];

    try {
      for (const discountItem of discItems) {
        const discount = this.discountRepository.create({
          desc_name: discountItem.desc_name,
          desc_amount: discountItem.desc_amount,
          ticket: { id: ticketId },
        });

        const savedDiscount = await this.discountRepository.save(discount);
        savedDiscounts.push(savedDiscount); // Store the saved discount in the array
      }

      return savedDiscounts; // Return the array of saved discounts
    } catch (err) {
      console.log(err);
      throw new Error('Failed to save discounts.'); // Throw an exception for better error handling
    }
  }
}
