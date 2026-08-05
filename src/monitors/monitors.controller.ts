import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ChecksService } from '../checks/checks.service';
import { MonitorsService } from './monitors.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('monitors')
@UseGuards(JwtAuthGuard)
export class MonitorsController {
  constructor(
    private readonly monitorsService: MonitorsService,
    private readonly checksService: ChecksService,
    private readonly schedulerService: SchedulerService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() createMonitorDto: CreateMonitorDto,
  ) {
    return this.monitorsService.create(user.userId, createMonitorDto);
  }

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.monitorsService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.monitorsService.findOne(id, user.userId);
  }

  @Get(':id/history')
  async history(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    const monitor = await this.monitorsService.findOne(id, user.userId);
    if (!monitor) {
      throw new NotFoundException('Монітор не знайдено');
    }
    return this.checksService.getHistory(id);
  }

  @Get(':id/stats')
  async stats(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    const monitor = await this.monitorsService.findOne(id, user.userId);
    if (!monitor) {
      throw new NotFoundException('Монітор не знайдено');
    }
    return this.checksService.getStats(id);
  }

  @Post(':id/check')
  async checkNow(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    const monitor = await this.monitorsService.findOne(id, user.userId);
    if (!monitor) {
      throw new NotFoundException('Монітор не знайдено');
    }

    const result = await this.schedulerService.runCheckForMonitor(id);
    const stats = await this.checksService.getStats(id);

    return {
      ...result,
      stats,
      monitor: await this.monitorsService.findOne(id, user.userId),
    };
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() updateMonitorDto: UpdateMonitorDto,
  ) {
    return this.monitorsService.update(id, user.userId, updateMonitorDto);
  }

  @Patch(':id/pause')
  pause(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.monitorsService.setActive(id, user.userId, false);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.monitorsService.remove(id, user.userId);
  }
}
