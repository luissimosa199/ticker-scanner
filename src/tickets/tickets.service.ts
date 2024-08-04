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
import { HtmlToMarkdownService } from 'src/html-to-markdown/html-to-markdown.service';
import { OpenAiService } from 'src/open-ai/open-ai.service';
import { SupermarketUtils } from 'src/utilities/supermarket.util';

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
    private htmlToMarkdownService: HtmlToMarkdownService,
    private readonly openAiService: OpenAiService,
  ) {}

  // create(createTicketDto: CreateTicketDto) {
  //   const parsedData = this.ticketParser.parse(
  //     createTicketDto.supermarket,
  //     createTicketDto.rawTicketHTML,
  //     createTicketDto.og_ticket_url,
  //   );

  //   return { ...parsedData, supermarket: createTicketDto.supermarket };
  // }

  async create(createTicketDto: CreateTicketDto) {
    const parsedData = this.htmlToMarkdownService.convertHtmlToMarkdown(
      createTicketDto.rawTicketHTML,
    );

    const jsonRawData = await this.openAiService.parseTicketToJson(parsedData);

    const ticketData = JSON.parse(jsonRawData) as Omit<
      Ticket,
      'id' | 'user_email' | 'date' | 'created_at' | 'updated_at'
    >;

    const date = new Date().toISOString();
    const logo_link =
      SupermarketUtils.getLogo(
        SupermarketUtils.getSupermarketFromName(ticketData.supermarket),
      ) || '';
    const og_ticket_url = createTicketDto.og_ticket_url;
    const supermarket =
      SupermarketUtils.getSupermarketFromName(ticketData.supermarket) ||
      ticketData.supermarket;

    const isValid = this.validateTicketObject(ticketData);

    if (isValid) {
      return {
        ...ticketData,
        date,
        logo_link,
        og_ticket_url,
        supermarket,
      };
    } else {
      // handle failed validations
    }
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
            date: 'DESC',
          },
          skip: (page - 1) * limit,
          take: limit,
        },
      );

      if (!rawTicket || rawTicket.length === 0) {
        return {
          message: 'This user has no tickets yet.',
          status: HttpStatus.NO_CONTENT,
        };
      }

      const ticketItemPromises = rawTicket.map(async (ticket) => {
        const ticketItems = await this.ticketItemRepository.find({
          where: {
            ticket_id: ticket.id,
          },
          select: ['id', 'name', 'quantity', 'price', 'total'],
        });

        const ticketItemsAsNumbers = ticketItems
          ? ticketItems.map((item) => ({
              ...item,
              quantity: item.quantity !== null ? Number(item.quantity) : null,
              price:
                item.price !== null
                  ? parseFloat(parseFloat(`${item.price}`).toFixed(2))
                  : null,
              total:
                item.total !== null
                  ? parseFloat(parseFloat(`${item.total}`).toFixed(2))
                  : null,
            }))
          : [];

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

        const discountAsNumbers = discount
          ? discount.map((item) => ({
              ...item,
              desc_amount: parseFloat(
                parseFloat(`${item.desc_amount}`).toFixed(2),
              ),
            }))
          : [];

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

  async findOne(id: string, user_email: string) {
    const ticket = await this.ticketsRepository.findOne({
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
    discount: { desc_items: { desc_name: string; desc_amount: number }[] },
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
        discount.desc_items,
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

  private validateTicketObject(ticketObject) {
    const schema = {
      total_amount: 'number',
      address: 'string',
      payment_method: 'string',
      supermarket: 'string',
      ticket_items: 'array',
      discount: 'object',
    };

    const itemSchema = {
      name: 'string',
      quantity: 'number',
      price: 'number',
      total: 'number',
    };

    const discountSchema = {
      desc_items: 'array',
      desc_total: 'number',
    };

    const descItemSchema = {
      desc_name: 'string',
      desc_amount: 'number',
    };

    function validateSchema(obj, schema, prefix) {
      for (const key in schema) {
        if (!obj.hasOwnProperty(key)) {
          return { success: false, message: `Missing field: ${prefix}${key}` };
        }

        if (schema[key] === 'array') {
          if (!Array.isArray(obj[key])) {
            return {
              success: false,
              message: `Incorrect type for field: ${prefix}${key}. Expected array but got ${typeof obj[
                key
              ]}`,
            };
          }
        } else if (schema[key] === 'object') {
          if (typeof obj[key] !== 'object' || Array.isArray(obj[key])) {
            return {
              success: false,
              message: `Incorrect type for field: ${prefix}${key}. Expected object but got ${typeof obj[
                key
              ]}`,
            };
          }
        } else if (typeof obj[key] !== schema[key]) {
          return {
            success: false,
            message: `Incorrect type for field: ${prefix}${key}. Expected ${
              schema[key]
            } but got ${typeof obj[key]}`,
          };
        }
      }
      return { success: true };
    }

    let result = validateSchema(ticketObject, schema, '');
    if (!result.success) return result;

    if (!Array.isArray(ticketObject.ticket_items)) {
      return { success: false, message: 'ticket_items should be an array' };
    }

    for (let i = 0; i < ticketObject.ticket_items.length; i++) {
      result = validateSchema(
        ticketObject.ticket_items[i],
        itemSchema,
        `ticket_items[${i}].`,
      );
      if (!result.success) return result;
    }

    result = validateSchema(ticketObject.discount, discountSchema, 'discount.');
    if (!result.success) return result;

    if (!Array.isArray(ticketObject.discount.desc_items)) {
      return {
        success: false,
        message: 'discount.desc_items should be an array',
      };
    }

    for (let i = 0; i < ticketObject.discount.desc_items.length; i++) {
      result = validateSchema(
        ticketObject.discount.desc_items[i],
        descItemSchema,
        `discount.desc_items[${i}].`,
      );
      if (!result.success) return result;
    }

    return { success: true, message: 'Validation successful' };
  }
}
