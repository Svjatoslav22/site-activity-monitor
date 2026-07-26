import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChecksService } from './checks.service';
import { Check, CheckSchema } from './schemas/check.schema';
import { Monitor, MonitorSchema } from '../monitors/schemas/monitor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Check.name, schema: CheckSchema },
      { name: Monitor.name, schema: MonitorSchema },
    ]),
  ],
  providers: [ChecksService],
  exports: [ChecksService],
})
export class ChecksModule {}
