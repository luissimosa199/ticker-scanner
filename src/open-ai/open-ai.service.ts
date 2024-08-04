import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async parseTicketToJson(rawBill: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an expert assistant specializing in processing unstructured text and outputting structured JSON data.',
        },
        {
          role: 'user',
          content:
            'You will receive a text containing unstructured information about a supermarket purchase. This text will include details such as the total amount, items, discounts, prices, supermarket name, address, and more. Your task is to extract this information and format it into a JSON object with the following structure:\n\n{\n  "total_amount": number,\n  "address": string,\n  "payment_method": string,\n  "supermarket": string, // (in uppercase)\n  "ticket_items": [\n    {\n      "name": string,\n      "quantity": number,\n      "price": number,\n      "total": number\n    }\n  ],\n  "discount": {\n    "desc_items": [\n      {\n        "desc_name": string,\n        "desc_amount": number\n      }\n    ],\n    "desc_total": number\n  }\n}\n\nEnsure that the supermarket name is in uppercase and that the JSON is correctly formatted.',
        },
        { role: 'user', content: rawBill },
      ],
    });

    return response.choices[0].message.content;
  }
}
