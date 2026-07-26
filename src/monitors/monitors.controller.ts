import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChecksService } from '../checks/checks.service';
import { MonitorsService } from './monitors.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';

@Controller('monitors')
export class MonitorsController {
  constructor(
    private readonly monitorsService: MonitorsService,
    private readonly checksService: ChecksService,
  ) {}

  @Post()
  create(@Body() createMonitorDto: CreateMonitorDto) {
    return this.monitorsService.create(createMonitorDto);
  }

  @Get()
  findAll() {
    return this.monitorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.monitorsService.findOne(id);
  }

  @Get(':id/history')
  history(@Param('id') id: string) {
    return this.checksService.getHistory(id);
  }

  @Get(':id/stats')
  stats(@Param('id') id: string) {
    return this.checksService.getStats(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMonitorDto: UpdateMonitorDto) {
    return this.monitorsService.update(id, updateMonitorDto);
  }

  @Patch(':id/pause')
  pause(@Param('id') id: string) {
    return this.monitorsService.setActive(id, false);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.monitorsService.remove(id);
  }
}
