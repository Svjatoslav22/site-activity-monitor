import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { Check, CheckDocument } from './schemas/check.schema';
import { Monitor, MonitorDocument } from '../monitors/schemas/monitor.schema';

@Injectable()
export class ChecksService {
  constructor(
    @InjectModel(Check.name) private checkModel: Model<CheckDocument>,
    @InjectModel(Monitor.name) private monitorModel: Model<MonitorDocument>,
  ) {}

  async runCheck(monitor: MonitorDocument) {
    const start = Date.now();
    let status = 'down';
    let statusCode: number | null = null;
    let errorMsg: string | null = null;

    try {
      const response = await axios.get(monitor.url, {
        timeout: 10000,
        validateStatus: () => true,
      });

      statusCode = response.status;
      if (statusCode < 400) {
        status = 'up';
      } else {
        errorMsg = `HTTP Помилка: ${statusCode}`;
      }
    } catch (err: unknown) {
      errorMsg = err instanceof Error ? err.message : 'Unknown error';
    }

    const responseTime = Date.now() - start;
    const previousStatus = monitor.lastStatus;
    const monitorId = monitor._id.toString();

    await this.checkModel.create({
      monitorId,
      status,
      responseTime,
      statusCode,
      error: errorMsg,
    });

    await this.monitorModel.findByIdAndUpdate(monitorId, {
      lastStatus: status,
      lastCheckedAt: new Date(),
    });

    // ... в кінці методу runCheck
    return {
      status,
      responseTime,
      statusCode,
      previousStatus,
      error: errorMsg,
    };
  }

  async getHistory(monitorId: string) {
    return this.checkModel
      .find({ monitorId })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async getStats(monitorId: string) {
    const totalChecks = await this.checkModel.countDocuments({ monitorId });
    const upChecks = await this.checkModel.countDocuments({
      monitorId,
      status: 'up',
    });

    const latestCheck = await this.checkModel
      .findOne({ monitorId })
      .sort({ createdAt: -1 });

    const avgResult = await this.checkModel.aggregate<{ avg: number }>([
      { $match: { monitorId, status: 'up', responseTime: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$responseTime' } } },
    ]);

    const monitor = await this.monitorModel.findById(monitorId);

    const uptimePercentage =
      totalChecks === 0
        ? 100
        : Math.round((upChecks / totalChecks) * 10000) / 100;

    const averageResponseTime =
      avgResult[0]?.avg ?? latestCheck?.responseTime ?? null;
    const latestPing = latestCheck?.responseTime ?? null;
    const lastCheck =
      monitor?.lastCheckedAt ??
      (latestCheck as { createdAt?: Date } | null)?.createdAt ??
      null;

    return {
      uptimePercentage,
      uptimePercent: uptimePercentage,
      averageResponseTime,
      latestPing,
      lastCheck,
      totalChecks,
      lastStatus: latestCheck?.status ?? monitor?.lastStatus ?? 'unknown',
    };
  }
}
