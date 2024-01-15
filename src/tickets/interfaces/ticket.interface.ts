export interface TicketItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Discounts {
  disc_items: { desc_name: string; desc_amount: number }[];
  disc_total: number;
}

export interface Ticket {
  logo_link: string;
  total_amount: number;
  ticket_items: TicketItem[];
  address: string;
  date: string;
  discounts: Discounts;
  payment_method: string;
  og_ticket_url: string;
  user?: string;
}
