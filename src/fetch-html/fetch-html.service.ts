import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { map, catchError, throwError } from 'rxjs';

@Injectable()
export class FetchHtmlService {
  constructor(private httpService: HttpService) {}

  fetchHtml(url: string) {
    try {
      new URL(url);
    } catch (_) {
      throw new BadRequestException('Invalid URL');
    }

    return this.httpService.get(url, { responseType: 'text' }).pipe(
      map((response: AxiosResponse<string>) => response.data),

      catchError((err: any) =>
        throwError(
          () =>
            new BadRequestException(
              `Failed to fetch URL ${JSON.stringify(err)}`,
            ),
        ),
      ),
    );
  }
}
