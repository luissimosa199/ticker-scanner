import { Supermarket } from 'src/tickets/dto/create-ticket.dto';

export class SupermarketLogoUtil {
  private static logoMap = new Map<Supermarket, string>([
    [
      Supermarket.DISCO,
      'https://res.cloudinary.com/ds2ujzebg/image/upload/v1704674554/logo_disco_tzjl49.png',
    ],
    [
      Supermarket.JUMBO,
      'https://res.cloudinary.com/ds2ujzebg/image/upload/v1704674554/logo_jumbo_socl7c.png',
    ],
    [
      Supermarket.EASY,
      'https://res.cloudinary.com/ds2ujzebg/image/upload/v1704674554/logoeasy_vp3l0s.png',
    ],
    [
      Supermarket.VEA,
      'https://res.cloudinary.com/ds2ujzebg/image/upload/v1704674554/logo_vea_clnxwn.png',
    ],
    [
      Supermarket.COTO,
      'https://res.cloudinary.com/ds2ujzebg/image/upload/v1704675060/coto_logo_gqlk8x.png',
    ],
    // add more supermarkets as needed
  ]);

  static getLogo(supermarketName: Supermarket): string {
    return this.logoMap.get(supermarketName);
  }
}
