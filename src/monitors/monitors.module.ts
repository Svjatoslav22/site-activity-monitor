import { Module } from '@nestjs/common';
import { MonitorsService } from './monitors.service';
import { MonitorsController } from './monitors.controller';
import { MonitorSchema } from './schemas/monitor.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ChecksModule } from '../checks/checks.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Monitor', schema: MonitorSchema }]),
    ChecksModule,
  ],

  controllers: [MonitorsController],
  providers: [MonitorsService],
})
export class MonitorsModule {}
