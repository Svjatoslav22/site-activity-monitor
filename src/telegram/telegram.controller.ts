import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Request } from 'express';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('status')
  async getStatus(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    let userId: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const base64Url = token.split('.')[1];
        if (base64Url) {
          const payload = JSON.parse(
            Buffer.from(base64Url, 'base64').toString('utf8'),
          );
          userId = payload.sub || payload.userId;
        }
      } catch {
        // ignore malformed token for public status
      }
    }

    if (!userId && req.query.userId) {
      userId = String(req.query.userId);
    }

    return this.telegramService.getStatus(userId);
  }

  @Post('test')
  @UseGuards(JwtAuthGuard)
  sendTest(@CurrentUser() user: { userId: string }) {
    return this.telegramService.sendTestMessage(user.userId);
  }

  @Post('connect')
  @UseGuards(JwtAuthGuard)
  connect(
    @CurrentUser() user: { userId: string },
    @Body('chatId') chatId: string,
  ) {
    return this.telegramService.connectChatId(user.userId, chatId);
  }

  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  disconnect(@CurrentUser() user: { userId: string }) {
    return this.telegramService.disconnectUser(user.userId);
  }
}
