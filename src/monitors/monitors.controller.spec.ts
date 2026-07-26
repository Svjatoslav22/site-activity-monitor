import { Test, TestingModule } from '@nestjs/testing';
import { MonitorsController } from './monitors.controller';
import { MonitorsService } from './monitors.service';
import { ChecksService } from '../checks/checks.service';

describe('MonitorsController', () => {
  let controller: MonitorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitorsController],
      providers: [
        {
          provide: MonitorsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            setActive: jest.fn(),
          },
        },
        {
          provide: ChecksService,
          useValue: {
            getHistory: jest.fn(),
            getStats: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MonitorsController>(MonitorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
