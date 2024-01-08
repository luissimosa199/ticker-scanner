import { Injectable } from '@nestjs/common';
import { parseNumberString } from '../../parseNumberString';
import { Ticket } from 'src/tickets/interfaces/ticket.interface';
import { SupermarketParser } from '../interfaces/supermarket-parser.interface';
import { JSDOM } from 'jsdom';
import { HtmlStructureError } from '../errors/html-structure.error';
import { Supermarket } from 'src/tickets/dto/create-ticket.dto';
import { SupermarketLogoUtil } from 'src/utilities/supermarket-logo.util';

@Injectable()
export class DiscoTicketParser implements SupermarketParser {
  parse(
    htmlString: string,
    ogTicketUrl: string,
    supermarket: Supermarket,
  ): Ticket {
    const dom = new JSDOM(htmlString);
    const doc = dom.window.document;

    // MAIN SELECTORS
    const element = doc.querySelector('.table-full');

    if (!element) {
      throw new HtmlStructureError("Couldn't find the main table selector.");
    }

    const articles = element?.querySelectorAll('.table-full-alt') || [];

    if (!articles.length) {
      throw new HtmlStructureError(
        "Couldn't find article rows in the main table.",
      );
    }

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

    if (!ticketItems.length) {
      throw new HtmlStructureError(
        'There has been an error parsing the the articles.',
      );
    }

    // TOTAL AMOUNT
    const totalAmountElements = doc.querySelectorAll(
      '.total-import.right.bold > div',
    );

    const totalAmountString = totalAmountElements[1]?.textContent?.trim() || '';
    const totalAmount = parseNumberString(totalAmountString);

    if (!totalAmount) {
      throw new HtmlStructureError(
        'There has been an error parsing the total amount of the ticket.',
      );
    }

    // LOGO LINK
    const logoLink = SupermarketLogoUtil.getLogo(supermarket);

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
    const discountsTable = doc.querySelector('table.table-discounts');
    let disc_items: { desc_name: string; desc_amount: number }[] = [];
    let disc_total: number = 0;

    if (discountsTable) {
      disc_items = Array.from(
        discountsTable.querySelectorAll('tbody tr'),
        (tr) => {
          const tds = tr.querySelectorAll('td');
          return {
            desc_name: tds[0].textContent.trim(),
            desc_amount: Math.abs(parseNumberString(tds[1].textContent.trim())),
          };
        },
      );

      const discTotalElem = doc.querySelector(
        'body > table > tbody > tr:nth-child(7) > td > table:nth-child(3) > tbody > tr > td:nth-child(2) div',
      );
      if (discTotalElem) {
        disc_total = Math.abs(
          parseNumberString(discTotalElem.textContent.trim()),
        );
      }
    }

    const discounts = {
      disc_items,
      disc_total,
    };

    // PAYMENT_METHOD

    const paymentMethod =
      doc
        .querySelector(
          'body > table > tbody > tr:nth-child(13) > td > table > tbody > tr:nth-child(1) > td:nth-child(1) > div',
        )
        .textContent.trim() || 'Payment Method not recognized';

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
