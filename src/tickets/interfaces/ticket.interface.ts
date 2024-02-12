export interface TicketItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface DiscountItem {
  desc_name: string;
  desc_amount: number;
}

export interface Discounts {
  desc_items: DiscountItem[];
  disc_total: number;
}

export interface Ticket {
  id: string;
  logo_link: string;
  total_amount: number;
  ticket_items: TicketItem[];
  address: string;
  date: string;
  discount: Discounts;
  payment_method: string;
  og_ticket_url: string;
  user_email: string;
  supermarket: string;
  created_at: string;
  updated_at: string;
}
