import { Injectable } from '@nestjs/common';
import { Ticket } from 'src/tickets/interfaces/ticket.interface';
import { SupermarketParser } from '../interfaces/supermarket-parser.interface';
import { JSDOM } from 'jsdom';
import { HtmlStructureError } from '../errors/html-structure.error';
import { Supermarket } from 'src/tickets/dto/create-ticket.dto';
import { SupermarketLogoUtil } from 'src/utilities/supermarket-logo.util';

@Injectable()
export class CotoTicketParser implements SupermarketParser {
  parse(
    htmlString: string,
    ogTicketUrl: string,
    supermarket: Supermarket,
  ): Ticket {
    const dom = new JSDOM(htmlString);
    const doc = dom.window.document;

    const ticketItems = Array.from(doc.querySelectorAll('.product-li')).map(
      (item) => {
        const name = item.querySelector('.info-producto-h2').textContent.trim();
        const [quantityString, priceString] = item
          .querySelector('.info-cant')
          .textContent.split('x')
          .map((s) => s.trim());

        const quantity = parseFloat(quantityString);
        const price = parseFloat(
          priceString.replace('$', '').replace(',', '.'),
        );

        const totalString = item.querySelector(
          '.info-producto-price',
        ).textContent;
        const total = parseFloat(
          totalString.replace('$', '').replace(',', '.'),
        );

        return {
          name,
          quantity,
          price,
          total,
        };
      },
    );

    const totalAmount = parseFloat(
      doc
        .querySelector('.info-total-border span.text-right')
        .innerHTML.replace('$', '')
        .replace(',', '.'),
    );

    const logoLink = SupermarketLogoUtil.getLogo(supermarket);

    const address = doc.querySelector('.info-direccion').textContent;

    const date = doc
      .querySelector('.info-ticket-main .text-big-grey.text-left')
      .textContent.replace('Fecha: ', '');

    const discountsSection = Array.from(doc.querySelectorAll('h2.second-title'))
      .find((h2) => h2.textContent.trim() === 'DETALLE DE OFERTAS APLICADAS')
      .closest('.col-md-12.bg-grey');

    const discountDivs = discountsSection.querySelectorAll('div.info-total');
    const discountsItems = Array.from(discountDivs).map((div) => {
      const desc_name = div.querySelector('span.text-left').textContent;
      const desc_amount = parseFloat(
        div
          .querySelector('span.text-right')
          .textContent.replace('$', '')
          .replace(',', '.')
          .replace('-', ''),
      );
      return { desc_name, desc_amount };
    });

    const discs_identifier = Array.from(
      doc.querySelectorAll('span.text-left'),
    ).find((span) => span.textContent.trim() === 'Ahorro por línea de cajas');
    const disc_span = discs_identifier.nextElementSibling;
    const disc_span_text = parseFloat(
      disc_span.textContent.replace('$', '').replace(',', '.').replace('-', ''),
    );

    const discounts = {
      disc_items: discountsItems,
      disc_total: disc_span_text,
    };

    const paymentMethod = doc.querySelector(
      '.info-total-gray .text-left',
    ).textContent;

    if (!ticketItems.length) {
      throw new HtmlStructureError(
        'There has been an error parsing the the articles.',
      );
    }

    console.log({
      ticketItems,
      totalAmount,
      logoLink,
      address,
      date,
      discounts,
      paymentMethod,
      ogTicketUrl,
    });

    return {
      ticketItems,
      totalAmount,
      logoLink,
      address,
      date,
      discounts,
      paymentMethod,
      ogTicketUrl,
    };
  }
}
