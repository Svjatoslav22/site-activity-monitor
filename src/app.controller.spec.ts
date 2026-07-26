import { Test, TestingModule } from '@nestjs/testing';
import * as jestGlobals from '@jest/globals';
import { AppController } from './app.controller';
import { AppService } from './app.service';

jestGlobals.describe('AppController', () => {
  let appController: AppController;

  jestGlobals.beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  jestGlobals.describe('root', () => {
    jestGlobals.it('should return dashboard html', () => {
      jestGlobals.expect(appController.getDashboard()).toContain('<html');
    });
  });
});
