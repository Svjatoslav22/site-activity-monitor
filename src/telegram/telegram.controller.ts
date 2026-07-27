import { Controller, Get, Post } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('status')
  getStatus() {
    return this.telegramService.getStatus();
  }

  @Post('test')
  sendTest() {
    return this.telegramService.sendTestMessage();
  }
}
