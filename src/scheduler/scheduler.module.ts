import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchedulerService } from './scheduler.service';
import { ChecksModule } from '../checks/checks.module';
import { Monitor, MonitorSchema } from '../monitors/schemas/monitor.schema';
import { TelegramService } from '../telegram/telegram.service';

@Module({
  imports: [
    ChecksModule, // Імпортуємо модуль перевірок
    MongooseModule.forFeature([{ name: Monitor.name, schema: MonitorSchema }]),
  ],
  providers: [SchedulerService, TelegramService],
})
export class SchedulerModule {}
