import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MonitorsService } from './monitors.service';
import { Monitor } from './schemas/monitor.schema';
import { SchedulerService } from '../scheduler/scheduler.service';

describe('MonitorsService', () => {
  let service: MonitorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitorsService,
        {
          provide: getModelToken(Monitor.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
        {
          provide: SchedulerService,
          useValue: {
            startMonitor: jest.fn(),
            stopMonitor: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MonitorsService>(MonitorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
