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
  logoLink: string;
  totalAmount: number;
  ticketItems: TicketItem[];
  address: string;
  date: string;
  discounts: Discounts;
  paymentMethod: string;
  ogTicketUrl: string;
  user?: string;
}
