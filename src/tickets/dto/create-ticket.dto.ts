export enum Supermarket {
  DISCO = 'DISCO',
  JUMBO = 'JUMBO',
  EASY = 'EASY'
  // OTHER_SUPERMARKET = 'OTHER_SUPERMARKET',
}

export class CreateTicketDto {
  rawTicketHTML: string;
  ogTicketUrl: string;
  supermarket: Supermarket;
  user?: string;
}
