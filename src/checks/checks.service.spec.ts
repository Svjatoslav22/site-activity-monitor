import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ChecksService } from './checks.service';
import { Check } from './schemas/check.schema';
import { Monitor } from '../monitors/schemas/monitor.schema';

describe('ChecksService', () => {
  let service: ChecksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChecksService,
        {
          provide: getModelToken(Check.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getModelToken(Monitor.name),
          useValue: {
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChecksService>(ChecksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
