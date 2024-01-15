export enum Supermarket {
  DISCO = 'DISCO',
  JUMBO = 'JUMBO',
  EASY = 'EASY',
  VEA = 'VEA',
  COTO = 'COTO',
  // OTHER_SUPERMARKET = 'OTHER_SUPERMARKET',
}

export class CreateTicketDto {
  rawTicketHTML: string;
  og_ticket_url: string;
  supermarket: Supermarket;
  user_email?: string;
}
