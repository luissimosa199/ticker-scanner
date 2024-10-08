import { Injectable } from '@nestjs/common';
import { Ticket } from 'src/tickets/interfaces/ticket.interface';
import { SupermarketParser } from '../interfaces/supermarket-parser.interface';
import { JSDOM } from 'jsdom';
import { HtmlStructureError } from '../errors/html-structure.error';
import { Supermarket } from 'src/tickets/dto/create-ticket.dto';
import { SupermarketUtils } from 'src/utilities/supermarket.util';

@Injectable()
export class CotoTicketParser implements SupermarketParser {
  parse(
    htmlString: string,
    og_ticket_url: string,
    supermarket: Supermarket,
  ): Omit<
    Ticket,
    'id' | 'user_email' | 'supermarket' | 'created_at' | 'updated_at'
  > {
    const dom = new JSDOM(htmlString);
    const doc = dom.window.document;

    const ticket_items = Array.from(doc.querySelectorAll('.product-li')).map(
      (item) => {
        const name = item.querySelector('.info-producto-h2').textContent.trim();

        const [quantityString, priceString] = item
          .querySelector('.info-cant')
          .textContent.split('x')
          .map((s) => s.trim());

        const quantity = parseFloat(quantityString);

        const totalString = item.querySelector(
          '.info-producto-price',
        ).textContent;

        const price = this.parseLocaleNumber(priceString);
        const total = this.parseLocaleNumber(totalString);

        return {
          name,
          quantity,
          price,
          total,
        };
      },
    );

    if (!ticket_items.length) {
      throw new HtmlStructureError("Couldn't find articles in the html.");
    }

    const total_amount =
      Math.abs(
        this.parseLocaleNumber(
          doc.querySelector('.info-total-border span.text-right').innerHTML,
        ),
      ) || 0;

    if (!ticket_items.length) {
      throw new HtmlStructureError("Couldn't find the total html.");
    }

    const logo_link = SupermarketUtils.getLogo(supermarket);

    const address = doc.querySelector('.info-direccion').textContent || '';

    const dateStr =
      doc
        .querySelector('.info-ticket-main .text-big-grey.text-left')
        .textContent.replace('Fecha: ', '') || '';

    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year + 2000, month - 1, day).toISOString();

    let discount = {
      desc_items: [],
      disc_total: 0,
    };

    const discountsSection = Array.from(
      doc.querySelectorAll('h2.second-title') || null,
    )
      .find((h2) => h2.textContent.trim() === 'DETALLE DE OFERTAS APLICADAS')
      ?.closest('.col-md-12.bg-grey');

    if (discountsSection) {
      const discountDivs = discountsSection.querySelectorAll('div.info-total');
      const discountsItems = Array.from(discountDivs).map((div) => {
        const desc_name = div.querySelector('span.text-left').textContent;
        const desc_amount =
          Math.abs(
            this.parseLocaleNumber(
              div.querySelector('span.text-right')?.textContent || '',
            ),
          ) || 0;
        return { desc_name, desc_amount };
      });

      const discsidentifier = Array.from(
        doc.querySelectorAll('span.text-left'),
      ).find((span) => span.textContent.trim() === 'Ahorro por línea de cajas');
      const disc_span = discsidentifier.nextElementSibling;
      const disc_span_text =
        Math.abs(this.parseLocaleNumber(disc_span.textContent)) || 0;

      discount = {
        desc_items: discountsItems,
        disc_total: disc_span_text,
      };
    }

    const payment_method = doc.querySelector(
      '.info-total-gray .text-left',
    ).textContent;

    if (!ticket_items.length) {
      throw new HtmlStructureError(
        'There has been an error parsing the the articles.',
      );
    }

    const ticket = {
      ticket_items,
      total_amount,
      logo_link,
      address,
      date,
      discount,
      payment_method,
      og_ticket_url,
    };

    return ticket;
  }

  parseLocaleNumber(stringNumber: string) {
    const parts = stringNumber.replace('$', '').replace(/\./g, '').split(',');
    const integerPart = parts.slice(0, -1).join('');
    const decimalPart = parts.slice(-1)[0];
    return parseFloat(integerPart + '.' + decimalPart);
  }
}
