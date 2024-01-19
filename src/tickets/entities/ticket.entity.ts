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
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('ticket_items')
export class TicketItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  quantity: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'uuid' })
  ticket_id: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.ticket_items)
  @JoinColumn({ name: 'ticket_id' })
  ticket: Relation<Ticket>;
}

// revisar
@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  desc_name: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  desc_amount: number;

  @Column({ type: 'uuid' })
  ticket_id: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.discount)
  @JoinColumn({ name: 'id' })
  ticket: Relation<Ticket>;
}

@Entity('tickets')
export class Ticket {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  logo_link: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total_amount: number;

  @OneToMany(() => TicketItem, (ticketItem) => ticketItem.ticket)
  ticket_items: Relation<TicketItem[]>;

  @OneToMany(() => Discount, (discount) => discount.ticket)
  @JoinColumn({ name: 'id' })
  discount: Relation<Discount>;

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
