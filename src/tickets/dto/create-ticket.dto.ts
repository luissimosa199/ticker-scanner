export enum Supermarket {
  DISCO = 'DISCO',
  // OTHER_SUPERMARKET = 'OTHER_SUPERMARKET',
}

export class CreateTicketDto {
  rawTicketHTML: string;
  ogTicketUrl: string;
  supermarket: Supermarket;
  user?: string;
}
