export interface TicketItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Discounts {
  disc_items: { desc_name: string; desc_amount: string }[];
  disc_total: string;
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
}
