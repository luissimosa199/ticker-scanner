import { Test, TestingModule } from '@nestjs/testing';
import { OpenAiService } from './open-ai.service';
import { ConfigService } from '@nestjs/config';

describe('OpenAiService', () => {
  let service: OpenAiService;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockConfigService = {
      get: (key: string) => {
        if (key === 'OPENAI_API_KEY') {
          return 'dummy-api-key'; // Provide a dummy API key
        }
        return null;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAiService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<OpenAiService>(OpenAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
