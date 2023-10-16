import { Injectable } from '@nestjs/common';
import { parseNumberString } from '../../parseNumberString';
import { Ticket } from 'src/tickets/interfaces/ticket.interface';
import { SupermarketParser } from '../interfaces/supermarket-parser.interface';
import { JSDOM } from 'jsdom';

@Injectable()
export class DiscoTicketParser implements SupermarketParser {
  parse(htmlString: string, ogTicketUrl: string): Ticket {
    const dom = new JSDOM(htmlString);
    const doc = dom.window.document;

    // MAIN SELECTORS
    const element = doc.querySelector('.table-full');
    const articles = element?.querySelectorAll('.table-full-alt') || [];

    // TICKET ITEMS
    const ticketItems: Ticket['ticketItems'] = Array.from(articles).map((e) => {
      const name =
        e.querySelector('td>div:nth-child(1)')?.textContent?.trim() || '';

      const quantity = parseFloat(
        (
          e
            .querySelector('td:nth-child(2)>div:nth-child(1)')
            ?.textContent?.trim() || ''
        ).replace(/,/g, '.'),
      );

      const price = parseFloat(
        (
          e
            .querySelector('td:nth-child(3)>div:nth-child(1)')
            ?.textContent?.trim() || ''
        )
          .replace(/[^0-9.,]+/g, '')
          .replace('.', '')
          .replace(',', '.'),
      );

      const total = parseFloat(
        (
          e
            .querySelector('td:nth-child(4)>div:nth-child(1)')
            ?.textContent?.trim() || ''
        )
          .replace(/[^0-9.,]+/g, '')
          .replace('.', '')
          .replace(',', '.'),
      );

      return { name, quantity, price, total };
    });

    // TOTAL AMOUN
    const totalAmountElements = doc.querySelectorAll(
      '.total-import.right.bold > div',
    );

    const totalAmountString = totalAmountElements[1]?.textContent?.trim() || '';
    const totalAmount = parseNumberString(totalAmountString);

    // LOGO LINK
    const logoLink = doc.querySelector('img')?.src || '';

    // ADDRESS
    const addressElement = doc.querySelector('.company-header:nth-child(3)');
    const address =
      addressElement?.textContent?.trim().replace('Dom.Com. ', '') || '';

    // DATE
    const emisionElement = Array.from(doc.querySelectorAll('div')).find(
      (element) => element.textContent?.includes('Emisión:'),
    );
    const emisionText = emisionElement?.textContent?.trim() || null;

    const date = emisionText ? emisionText.split(':')[1].trim() : '';

    // DISCOUNTS
    const discountsHTML = doc
      .querySelector('table.table-discounts')
      .querySelectorAll('tbody tr');

    const disc_items = Array.from(discountsHTML, (tr) => {
      const tds = tr.querySelectorAll('td');
      return {
        desc_name: tds[0].textContent.trim(),
        desc_amount: Math.abs(parseNumberString(tds[1].textContent.trim())),
      };
    });

    const disc_total = doc
      .querySelector(
        'body > table > tbody > tr:nth-child(7) > td > table:nth-child(3)',
      )
      .querySelector('td:nth-child(2) div')
      .textContent.trim();

    const discounts = {
      disc_items,
      disc_total: Math.abs(parseNumberString(disc_total)),
    };

    // PAYMENT_METHOD

    const paymentMethod = doc
      .querySelector(
        'body > table > tbody > tr:nth-child(13) > td > table > tbody > tr:nth-child(1) > td:nth-child(1) > div',
      )
      .textContent.trim();

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
