import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchedulerService } from './scheduler.service';
import { ChecksModule } from '../checks/checks.module';
import { Monitor, MonitorSchema } from '../monitors/schemas/monitor.schema';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    ChecksModule,
    TelegramModule,
    MongooseModule.forFeature([{ name: Monitor.name, schema: MonitorSchema }]),
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
