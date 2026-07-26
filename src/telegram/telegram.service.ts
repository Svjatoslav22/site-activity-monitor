import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
  private bot: TelegramBot | null = null;
  private chatId: string | number | null = null;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly configService: ConfigService) {
    const token =
      this.configService.get<string>('TELEGRAM_TOKEN') ??
      this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (!token) {
      this.logger.error(
        'Telegram bot token is missing. Set TELEGRAM_TOKEN or TELEGRAM_BOT_TOKEN.',
      );
      return;
    }

    if (!chatId || chatId === '1795893529') {
      this.logger.error(
        'Telegram chat id is missing or still a placeholder. Set TELEGRAM_CHAT_ID to a real numeric chat id.',
      );
      return;
    }

    this.chatId = chatId;
    this.bot = new TelegramBot(token, { polling: false });
  }

  async sendAlert(monitorName: string, url: string, error: string) {
    if (!this.bot || !this.chatId) {
      return;
    }

    const message =
      `🚨 <b>Увага! Сайт впав!</b>\n\n` +
      `<b>Сайт:</b> ${monitorName}\n` +
      `<b>URL:</b> ${url}\n` +
      `<b>Помилка:</b> ${error}`;

    await this.bot.sendMessage(this.chatId, message, {
      parse_mode: 'HTML',
    });
    this.logger.log(`Надіслано алерт про падіння для ${monitorName}`);
  }

  async sendRecovery(monitorName: string, url: string, responseTime: number) {
    if (!this.bot || !this.chatId) {
      return;
    }

    const message =
      `✅ <b>Сайт відновив роботу!</b>\n\n` +
      `<b>Сайт:</b> ${monitorName}\n` +
      `<b>URL:</b> ${url}\n` +
      `<b>Час відгуку:</b> ${responseTime}мс`;

    await this.bot.sendMessage(this.chatId, message, {
      parse_mode: 'HTML',
    });
    this.logger.log(`Надіслано сповіщення про відновлення для ${monitorName}`);
  }
}
