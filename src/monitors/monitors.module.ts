import { Module, forwardRef } from '@nestjs/common';
import { MonitorsService } from './monitors.service';
import { MonitorsController } from './monitors.controller';
import { MonitorSchema } from './schemas/monitor.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ChecksModule } from '../checks/checks.module';
import { SchedulerModule } from '../scheduler/scheduler.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Monitor', schema: MonitorSchema }]),
    ChecksModule,
    forwardRef(() => SchedulerModule),
  ],

  controllers: [MonitorsController],
  providers: [MonitorsService],
  exports: [MonitorsService],
})
export class MonitorsModule {}