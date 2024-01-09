import { Test, TestingModule } from '@nestjs/testing';
import { FetchHtmlService } from './fetch-html.service';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { BadRequestException } from '@nestjs/common';
import { catchError, firstValueFrom, of, throwError } from 'rxjs';

describe('FetchHtmlService', () => {
  let service: FetchHtmlService;
  let httpServiceMock: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FetchHtmlService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FetchHtmlService>(FetchHtmlService);
    httpServiceMock = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch HTML when a valid URL is provided', async () => {
    const url = 'https://example.com';
    const htmlResponse = '<html></html>';

    httpServiceMock.get.mockReturnValue(
      of({
        data: htmlResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as AxiosRequestConfig['headers'] },
      } as AxiosResponse<string>),
    );

    const resultObservable = service.fetchHtml(url);
    let result: string;

    resultObservable.subscribe((data) => {
      result = data;
    });

    await firstValueFrom(resultObservable);

    expect(result).toEqual(htmlResponse);
    expect(httpServiceMock.get).toHaveBeenCalledWith(url, {
      responseType: 'text',
    });
  });

  it('should throw BadRequestException for an invalid URL', async () => {
    const invalidUrl = 'invalid-url';

    try {
      await service.fetchHtml(invalidUrl);
      fail('Expected BadRequestException but got no exception');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('Invalid URL');
    }
  });

  it('should throw BadRequestException if HTTP request fails', async () => {
    const url = 'https://example.com';

    const errorMessage = 'HTTP request failed';
    httpServiceMock.get.mockReturnValue(
      throwError(() => ({
        response: {
          message: errorMessage,
          error: 'Bad Request',
          statusCode: 400,
        },
        status: 400,
        options: {},
      })),
    );

    await expect(
      firstValueFrom(
        service.fetchHtml(url).pipe(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          catchError((_error) => {
            throw new BadRequestException(
              `Failed to fetch URL "${errorMessage}"`,
            );
          }),
        ),
      ),
    ).rejects.toThrowError(
      new BadRequestException(`Failed to fetch URL "${errorMessage}"`),
    );

    expect(httpServiceMock.get).toHaveBeenCalledWith(url, {
      responseType: 'text',
    });
  });
});
