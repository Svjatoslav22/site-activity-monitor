import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Monitor, MonitorDocument } from './schemas/monitor.schema';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';

@Injectable()
export class MonitorsService {
  // За допомогою Dependency Injection "просимо" NestJS дати нам доступ до моделі Monitor
  constructor(
    @InjectModel(Monitor.name) private monitorModel: Model<MonitorDocument>,
  ) {}

  // Метод для додавання нового сайту в базу
  async create(dto: CreateMonitorDto) {
    return this.monitorModel.create(dto);
  }

  // Метод для отримання списку всіх сайтів
  async findAll() {
    return this.monitorModel.find();
  }

  // Отримання одного сайту за ID
  async findOne(id: string) {
    return this.monitorModel.findById(id);
  }

  // Оновлення сайту (наприклад, змінити інтервал перевірки)
  async update(id: string, dto: UpdateMonitorDto) {
    return this.monitorModel.findByIdAndUpdate(id, dto, { new: true });
  }

  // Видалення сайту
  async remove(id: string) {
    await this.monitorModel.findByIdAndDelete(id);
  }

  // Зміна статусу (пауза або відновлення моніторингу)
  async setActive(id: string, isActive: boolean) {
    return this.monitorModel.findByIdAndUpdate(id, { isActive }, { new: true });
  }
}
