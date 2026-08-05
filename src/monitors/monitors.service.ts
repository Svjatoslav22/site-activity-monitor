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

  async create(userId: string, dto: CreateMonitorDto) {
    const monitor = await this.monitorModel.create({ ...dto, userId });
    // Одразу запускаємо моніторинг для нового сайту
    this.schedulerService.startMonitor(monitor);
    return monitor;
  }

  async findAll(userId: string) {
    return this.monitorModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findOne(id: string, userId: string) {
    return this.monitorModel.findOne({ _id: id, userId });
  }

  async update(id: string, userId: string, dto: UpdateMonitorDto) {
    const updated = await this.monitorModel.findOneAndUpdate(
      { _id: id, userId },
      dto,
      {
      new: true,
      },
    );

    if (updated) {
      // Перезапускаємо таймер, щоб застосувати новий інтервал/URL
      this.schedulerService.stopMonitor(id);
      if (updated.isActive) {
        this.schedulerService.startMonitor(updated);
      }
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    this.schedulerService.stopMonitor(id);
    await this.monitorModel.findOneAndDelete({ _id: id, userId });
  }

  async setActive(id: string, userId: string, isActive: boolean) {
    const updated = await this.monitorModel.findOneAndUpdate(
      { _id: id, userId },
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
