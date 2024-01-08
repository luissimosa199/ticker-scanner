import { Test, TestingModule } from '@nestjs/testing';
import { FetchHtmlController } from './fetch-html.controller';
import { FetchHtmlService } from './fetch-html.service';
import { throwError } from 'rxjs';
import { BadRequestException } from '@nestjs/common';

describe('FetchHtmlController', () => {
  let controller: FetchHtmlController;
  let service: FetchHtmlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FetchHtmlController],
      providers: [
        {
          provide: FetchHtmlService,
          useValue: {
            fetchHtml: jest
              .fn()
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              .mockImplementation((_url: string) =>
                Promise.resolve('<html></html>'),
              ),
          },
        },
      ],
    }).compile();

    controller = module.get<FetchHtmlController>(FetchHtmlController);
    service = module.get<FetchHtmlService>(FetchHtmlService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call fetchHtml with correct url and return html', async () => {
    const url = 'http://example.com';
    const result = await controller.fetchHtml(url);
    expect(result).toBe('<html></html>');
    expect(service.fetchHtml).toHaveBeenCalledWith('http://example.com');
  });

  it('should throw an error for invalid url', async () => {
    const url = 'invalid-url';

    try {
      await controller.fetchHtml(url);
      fail('Expected BadRequestException but got no exception');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('Invalid URL');
    }
  });

  it('should handle service failure', async () => {
    const url = 'http://example.com';
    jest
      .spyOn(service, 'fetchHtml')
      .mockImplementationOnce(() =>
        throwError(() => new Error('Network error')),
      );
    await expect(controller.fetchHtml(url).toPromise()).rejects.toThrow(
      'Network error',
    );
  });
});
