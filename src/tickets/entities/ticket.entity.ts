import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Discounts, TicketItem } from '../interfaces/ticket.interface';
import { ObjectId } from 'mongodb';

@Entity('tickets')
export class Ticket {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  logoLink: string;

  @Column()
  totalAmount: number;

  @Column()
  ticketItems: TicketItem[];

  @Column()
  address: string;

  @Column()
  date: string;

  @Column()
  discounts: Discounts;

  @Column()
  paymentMethod: string;

  @Column()
  ogTicketUrl: string;

  @Column()
  supermarket: string;

  @Column()
  user?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
