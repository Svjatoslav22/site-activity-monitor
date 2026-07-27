import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChecksService } from '../checks/checks.service';
import { Monitor, MonitorDocument } from '../monitors/schemas/monitor.schema';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private intervals = new Map<string, NodeJS.Timeout>();
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private checksService: ChecksService,
    private telegramService: TelegramService,
    @InjectModel(Monitor.name) private monitorModel: Model<MonitorDocument>,
  ) {}

  async onModuleInit() {
    this.logger.log('Завантажуємо активні монітори з бази...');
    const monitors = await this.monitorModel.find({ isActive: true });

    for (const monitor of monitors) {
      this.startMonitor(monitor);
    }
  }

  onModuleDestroy() {
    this.logger.log('Зупиняємо всі таймери...');
    for (const [id] of this.intervals) {
      this.stopMonitor(id);
    }
  }

  startMonitor(monitor: MonitorDocument) {
    const monitorId = monitor._id.toString();

    if (this.intervals.has(monitorId)) return;

    const ms = monitor.interval * 60 * 1000;

    this.logger.log(
      `Старт моніторингу для ${monitor.name} кожні ${monitor.interval} хв.`,
    );

    void this.runCheckForMonitor(monitorId);

    const intervalId = setInterval(() => {
      void this.runCheckForMonitor(monitorId);
    }, ms);

    this.intervals.set(monitorId, intervalId);
  }

  async runCheckForMonitor(monitorId: string) {
    const monitor = await this.monitorModel.findById(monitorId);
    if (!monitor || !monitor.isActive) return;

    this.logger.debug(`[${monitor.name}] Пінгуємо: ${monitor.url}`);

    const result = await this.checksService.runCheck(monitor);

    if (result.previousStatus === 'up' && result.status === 'down') {
      await this.telegramService.sendAlert(
        monitor.name,
        monitor.url,
        result.error || "Помилка з'єднання",
        result.responseTime,
      );
    }

    if (
      (result.previousStatus === 'down' ||
        result.previousStatus === 'unknown') &&
      result.status === 'up'
    ) {
      await this.telegramService.sendRecovery(
        monitor.name,
        monitor.url,
        result.responseTime,
      );
    }

    this.logger.debug(
      `[${monitor.name}] Статус: ${result.status} (${result.responseTime}ms)`,
    );

    return result;
  }

  stopMonitor(monitorId: string) {
    const intervalId = this.intervals.get(monitorId);

    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(monitorId);
      this.logger.log(`Моніторинг для ID ${monitorId} зупинено.`);
    }
  }
}
