import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Monitor, MonitorDocument } from './schemas/monitor.schema';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';
import { SchedulerService } from '../scheduler/scheduler.service';

@Injectable()
export class MonitorsService {
  constructor(
    @InjectModel(Monitor.name) private monitorModel: Model<MonitorDocument>,
    @Inject(forwardRef(() => SchedulerService))
    private schedulerService: SchedulerService,
  ) {}

  async create(dto: CreateMonitorDto) {
    const monitor = await this.monitorModel.create(dto);
    // Одразу запускаємо моніторинг для нового сайту
    this.schedulerService.startMonitor(monitor);
    return monitor;
  }

  async findAll() {
    return this.monitorModel.find();
  }

  async findOne(id: string) {
    return this.monitorModel.findById(id);
  }

  async update(id: string, dto: UpdateMonitorDto) {
    const updated = await this.monitorModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (updated) {
      // Перезапускаємо таймер, щоб застосувати новий інтервал/URL
      this.schedulerService.stopMonitor(id);
      if (updated.isActive) {
        this.schedulerService.startMonitor(updated);
      }
    }

    return updated;
  }

  async remove(id: string) {
    this.schedulerService.stopMonitor(id);
    await this.monitorModel.findByIdAndDelete(id);
  }

  async setActive(id: string, isActive: boolean) {
    const updated = await this.monitorModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );

    if (updated) {
      if (isActive) {
        this.schedulerService.startMonitor(updated);
      } else {
        this.schedulerService.stopMonitor(id);
      }
    }

    return updated;
  }
}
