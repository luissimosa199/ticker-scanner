import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Discount,
  Ticket,
  TicketItem,
} from '../tickets/entities/ticket.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(TicketItem)
    private ticketItemRepository: Repository<TicketItem>,
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async getMainStats(username: string) {
    const totalCount = await this.getTicketCount(username);
    const totalSpent = await this.getTotalSpent(username);
    const totalSpentLastYear = await this.getTotalSpentLastYear(username);
    const totalSpentLast90Days = await this.getTotalSpentLast90Days(username);
    const totalSpentLast30Days = await this.getTotalSpentLast30Days(username);
    const mostFrequentlyBoughtItems =
      await this.getMostFrequentlyBoughtItems(username);
    const totalDiscount = await this.getTotalDiscount(username);
    const firstScanDate = await this.getFirstScanDate(username);
    const monthlyStatistics = await this.getMonthlyStatistics(username);

    const mainStats = [
      { name: 'total count', id: 'TOTAL_COUNT', data: totalCount },
      { name: 'total spent', id: 'TOTAL_SPENT', data: totalSpent },
      {
        name: 'total spent last year',
        id: 'TOTAL_SPENT_LAST_YEAR',
        data: totalSpentLastYear,
      },
      {
        name: 'total spent 90 days',
        id: 'TOTAL_SPENT_LAST_90_DAYS',
        data: totalSpentLast90Days,
      },
      {
        name: 'total spent 30 days',
        id: 'TOTAL_SPENT_LAST_30_DAYS',
        data: totalSpentLast30Days,
      },
      {
        name: 'most frquently bought items',
        id: 'MOST_FREQUENTLY_BOUGHT_ITEM',
        data: mostFrequentlyBoughtItems,
      },
      {
        name: 'total discounts',
        id: 'TOTAL_DISCOUNT',
        data: totalDiscount,
      },
      {
        name: 'first scan date',
        id: 'FIRST_SCAN_DATE',
        data: firstScanDate,
      },
      {
        name: 'monthly statistics',
        id: 'MONTHLY_STATISTICS',
        data: monthlyStatistics,
      },
    ];

    return mainStats;
  }

  async getSpecificStat(username: string, stat: string) {
    switch (stat) {
      case 'totalCount':
        return this.getTicketCount(username);
      case 'totalSpent':
        return this.getTotalSpent(username);
      case 'totalSpentLastYear':
        return this.getTotalSpentLastYear(username);
      case 'totalSpentLast90Days':
        return this.getTotalSpentLast90Days(username);
      case 'totalSpentLast30Days':
        return this.getTotalSpentLast30Days(username);
      case 'mostFrequentlyBoughtItems':
        return this.getMostFrequentlyBoughtItems(username);
      case 'totalDiscount':
        return this.getTotalDiscount(username);
      case 'firstScanDate':
        return this.getFirstScanDate(username);
      case 'monthlyStatistics':
        return this.getMonthlyStatistics(username);
      // Add more cases for other stats
      default:
        throw new NotFoundException(`Stat '${stat}' not found`);
    }
  }

  async getTotalSpent(username: string) {
    try {
      const result = await this.dataSource.query(
        `
        SELECT SUM(total_amount) AS total_spent
        FROM tickets
        WHERE user_email = $1
        `,
        [username],
      );

      return result[0].total_spent;
    } catch (error) {
      throw new Error('Failed to get total spent');
    }
  }

  async getTicketCount(username: string) {
    const totalTickets = await this.ticketsRepository.count({
      where: {
        user_email: username,
      },
    });

    return totalTickets;
  }

  async getTotalSpentLastYear(username: string) {
    try {
      const result = await this.dataSource.query(
        `
        SELECT SUM(total_amount) AS total_spent_last_year
        FROM tickets
        WHERE user_email = $1
          AND date >= NOW() - INTERVAL '12 months'
        `,
        [username],
      );

      return result[0].total_spent_last_year;
    } catch (error) {
      throw new Error('Failed to get total spent last year');
    }
  }

  async getTotalSpentLast90Days(username: string) {
    try {
      const result = await this.dataSource.query(
        `
        SELECT SUM(total_amount) AS total_spent_last_90_days
        FROM tickets
        WHERE user_email = $1
          AND date >= NOW() - INTERVAL '90 days'
        `,
        [username],
      );

      return result[0].total_spent_last_90_days;
    } catch (error) {
      throw new Error('Failed to get total spent last 90 days');
    }
  }

  async getTotalSpentLast30Days(username: string) {
    try {
      const result = await this.dataSource.query(
        `
        SELECT SUM(total_amount) AS total_spent_last_30_days
        FROM tickets
        WHERE user_email = $1
          AND date >= NOW() - INTERVAL '30 days'
        `,
        [username],
      );

      return result[0].total_spent_last_30_days;
    } catch (error) {
      throw new Error('Failed to get total spent last 30 days');
    }
  }

  async getMostFrequentlyBoughtItems(username: string) {
    try {
      const result = await this.dataSource.query(
        `
        SELECT name,
        SUM(quantity) AS Total_Quantity,
        SUM(quantity * price) AS Total_Spent
        FROM ticket_items
        WHERE ticket_id IN (SELECT id FROM tickets WHERE user_email = $1)
        GROUP BY name
        ORDER BY Total_Quantity DESC
        LIMIT 3
 
        `,
        [username],
      );

      return result;
    } catch (error) {
      throw new Error('Failed to get most frequently bought items');
    }
  }

  async getTotalDiscount(username: string) {
    try {
      const result = await this.dataSource.query(
        `
        SELECT SUM(d.desc_amount) as Total_Discount
        FROM discounts d
        JOIN tickets t ON t.id = d.ticket_id
        WHERE t.user_email = $1;
        `,
        [username],
      );

      return result[0].total_discount;
    } catch (error) {
      throw new Error('Failed to get total discount');
    }
  }

  async getFirstScanDate(username: string) {
    try {
      const result = await this.dataSource.query(
        `
        SELECT MIN(date) AS first_scan_date
        FROM tickets
        WHERE user_email = $1;
 
        `,
        [username],
      );

      return result[0].first_scan_date;
    } catch (error) {
      throw new Error('Failed to get first scan date');
    }
  }

  async getMonthlyStatistics(username: string) {
    try {
      const result = await this.dataSource.query(
        `
        WITH monthly_summary AS (
          SELECT
            DATE_PART('month', date) AS month_number,
            CASE
              WHEN DATE_PART('day', date) <= 15 THEN 'first_half'
              ELSE 'second_half'
            END AS half_month,
            SUM(total_amount) AS amount
          FROM tickets
          WHERE user_email = $1
            AND date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '3 months'
            AND date < DATE_TRUNC('month', CURRENT_DATE)
          GROUP BY month_number, half_month
        )
        
        SELECT
          month_number,
          half_month,
          amount,
          (amount / SUM(amount) OVER (PARTITION BY month_number)) * 100 AS percentage
        FROM monthly_summary
        ORDER BY month_number, half_month;        
        `,
        [username],
      );

      return result;
    } catch (error) {
      console.error('Failed to get monthly statistics:', error);
      throw new Error('Failed to get monthly statistics');
    }
  }

  async getWhateverData(username: string) {
    try {
      const result = await this.dataSource.query(
        `
        ...
        WHERE t.user_email = $1
 
        `,
        [username],
      );

      return result;
    } catch (error) {
      throw new Error('Failed to get data');
    }
  }
}
