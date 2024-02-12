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
    og_ticket_url: string,
    supermarket: Supermarket,
  ): Omit<
    Ticket,
    'id' | 'user_email' | 'supermarket' | 'created_at' | 'updated_at'
  > {
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
    const ticket_items: Ticket['ticket_items'] = Array.from(articles).map(
      (e) => {
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
      },
    );

    if (!ticket_items.length) {
      throw new HtmlStructureError(
        'There has been an error parsing the the articles.',
      );
    }

    // TOTAL AMOUNT
    const totalAmountElements = doc.querySelectorAll(
      '.total-import.right.bold > div',
    );

    const totalAmountString = totalAmountElements[1]?.textContent?.trim() || '';
    const total_amount = parseNumberString(totalAmountString);

    if (!total_amount) {
      throw new HtmlStructureError(
        'There has been an error parsing the total amount of the ticket.',
      );
    }

    // LOGO LINK
    const logo_link = SupermarketLogoUtil.getLogo(supermarket);

    // ADDRESS
    const addressElement = doc.querySelector('.company-header:nth-child(3)');
    const address =
      addressElement?.textContent?.trim().replace('Dom.Com. ', '') || '';

    // DATE
    const emisionElement = Array.from(doc.querySelectorAll('div')).find(
      (element) => element.textContent?.includes('Emisión:'),
    );
    const emisionText = emisionElement?.textContent?.trim() || null;

    const dateStr = emisionText ? emisionText.split(':')[1].trim() : '';
    const date = new Date(dateStr.split('/').reverse().join('-')).toISOString();

    // DISCOUNTS
    const discountsTable = doc.querySelector('table.table-discounts');
    let desc_items: { desc_name: string; desc_amount: number }[] = [];
    let disc_total: number = 0;

    if (discountsTable) {
      desc_items = Array.from(
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

    const discount = {
      desc_items,
      disc_total,
    };

    // PAYMENT_METHOD

    const payment_method =
      doc
        .querySelector(
          'body > table > tbody > tr:nth-child(13) > td > table > tbody > tr:nth-child(1) > td:nth-child(1) > div',
        )
        .textContent.trim() || 'Payment Method not recognized';

    return {
      ticket_items,
      total_amount,
      logo_link,
      address,
      date,
      discount,
      payment_method,
      og_ticket_url,
    };
  }
}
