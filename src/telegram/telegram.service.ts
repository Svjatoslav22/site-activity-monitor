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

  async sendAlert(
    monitorName: string,
    url: string,
    error: string,
    responseTime?: number,
  ) {
    const time = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });
    const pingLine =
      responseTime != null ? `\n<b>Останній пінг:</b> ${responseTime} мс` : '';

    const message =
      `🚨 <b>Сайт недоступний</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `<b>📌 Назва:</b> ${this.escapeHtml(monitorName)}\n` +
      `<b>🔗 URL:</b> ${this.escapeHtml(url)}\n` +
      `<b>❌ Помилка:</b> ${this.escapeHtml(error)}${pingLine}\n` +
      `<b>🕐 Час:</b> ${time}\n\n` +
      `<i>Перевірте сервер або налаштування DNS.</i>`;

    await this.sendMessage(message, `алерт про падіння: ${monitorName}`);
  }

  async sendRecovery(monitorName: string, url: string, responseTime: number) {
    const time = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });

    const message =
      `✅ <b>Сайт знову працює</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `<b>📌 Назва:</b> ${this.escapeHtml(monitorName)}\n` +
      `<b>🔗 URL:</b> ${this.escapeHtml(url)}\n` +
      `<b>⚡ Пінг:</b> ${responseTime} мс\n` +
      `<b>🕐 Час:</b> ${time}`;

    await this.sendMessage(message, `відновлення: ${monitorName}`);
  }

  getStatus() {
    const botUsername =
      this.configService.get<string>('TELEGRAM_BOT_USERNAME') ??
      'pocketnote2vbot';

    return {
      configured: !!(this.bot && this.chatId !== null),
      chatId: this.chatId,
      botUsername,
      botUrl: `https://t.me/${botUsername.replace('@', '')}`,
    };
  }

  async sendTestMessage() {
    if (!this.bot || this.chatId === null) {
      return { ok: false, message: 'Telegram не налаштовано' };
    }

    const message =
      `🔔 <b>Тестове сповіщення</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `SiteMonitor підключено успішно!\n` +
      `Ви отримуватимете алерти про статус сайтів.`;

    await this.sendMessage(message, 'тестове повідомлення');
    return { ok: true, message: 'Тестове повідомлення надіслано' };
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
