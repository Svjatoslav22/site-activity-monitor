import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';

const PLACEHOLDER_CHAT_IDS = new Set([
  '',
  'your_chat_id',
  'your-chat-id',
  'changeme',
  'placeholder',
  '123456789',
]);

@Injectable()
export class TelegramService {
  private bot: TelegramBot | null = null;
  private chatId: number | null = null;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly configService: ConfigService) {
    const token =
      this.configService.get<string>('TELEGRAM_TOKEN') ??
      this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const rawChatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (!token) {
      this.logger.error(
        'Telegram bot token is missing. Set TELEGRAM_TOKEN or TELEGRAM_BOT_TOKEN in .env',
      );
      return;
    }

    const chatId = this.parseChatId(rawChatId);
    if (chatId === null) {
      this.logger.warn(
        `Telegram chat id is missing or still a placeholder (raw="${rawChatId ?? ''}"). Set TELEGRAM_CHAT_ID to your numeric chat id in .env`,
      );
      return;
    }

    this.chatId = chatId;
    this.bot = new TelegramBot(token, { polling: false });
    this.logger.log(`Telegram bot initialized for chat id ${chatId}`);
  }

  private parseChatId(raw: string | undefined): number | null {
    if (!raw) {
      return null;
    }

    const trimmed = raw.trim();
    if (PLACEHOLDER_CHAT_IDS.has(trimmed.toLowerCase())) {
      return null;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      return null;
    }

    return parsed;
  }

  private async sendMessage(message: string, context: string): Promise<void> {
    if (!this.bot || this.chatId === null) {
      return;
    }

    try {
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
      });
      this.logger.log(`Telegram: ${context}`);
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; body?: unknown; data?: unknown };
        message?: string;
      };
      const apiError = err.response?.body ?? err.response?.data;
      this.logger.error(
        `Telegram API error (${context}): status=${err.response?.status ?? 'n/a'} ${err.message ?? 'unknown error'}`,
        apiError ? JSON.stringify(apiError) : undefined,
      );
    }
  }

  async sendAlert(monitorName: string, url: string, error: string) {
    const message =
      `🚨 <b>Увага! Сайт впав!</b>\n\n` +
      `<b>Сайт:</b> ${monitorName}\n` +
      `<b>URL:</b> ${url}\n` +
      `<b>Помилка:</b> ${error}`;

    await this.sendMessage(message, `надіслано алерт про падіння для ${monitorName}`);
  }

  async sendRecovery(monitorName: string, url: string, responseTime: number) {
    const message =
      `✅ <b>Сайт відновив роботу!</b>\n\n` +
      `<b>Сайт:</b> ${monitorName}\n` +
      `<b>URL:</b> ${url}\n` +
      `<b>Час відгуку:</b> ${responseTime}мс`;

    await this.sendMessage(
      message,
      `надіслано сповіщення про відновлення для ${monitorName}`,
    );
  }
}
