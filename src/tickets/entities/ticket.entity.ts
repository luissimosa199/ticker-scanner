import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('ticket_items')
export class TicketItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'numeric' })
  quantity: number;

  @Column({ type: 'numeric' })
  price: number;

  @Column({ type: 'numeric' })
  total: number;

  @ManyToOne(() => Ticket, (ticket) => ticket.ticket_items) // Adjust the property name
  @JoinColumn({ name: 'ticket_id' }) // Use the correct column name
  ticket: Ticket; // Change the type from function to the actual type
}

@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  desc_name: string;

  @Column()
  desc_amount: number;

  @OneToMany(() => Ticket, (ticket) => ticket.discount)
  tickets: () => Ticket[];
}

@Entity('tickets')
export class Ticket {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  logo_link: string;

  @Column()
  total_amount: number;

  @OneToMany(() => TicketItem, (ticketItem) => ticketItem.ticket)
  ticket_items: TicketItem[];

  @ManyToOne(() => Discount, (discount) => discount.tickets)
  @JoinColumn({ name: 'discount_id' })
  discount: () => Discount;

  @Column()
  address: string;

  @Column()
  date: string;

  @Column()
  payment_method: string;

  @Column()
  og_ticket_url: string;

  @Column()
  supermarket: string;

  @Column()
  user_email?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }
}
