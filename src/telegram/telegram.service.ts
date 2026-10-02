import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import TelegramBot from 'node-telegram-bot-api';
import { UsersService } from '../users/users.service';
import { Monitor, MonitorDocument } from '../monitors/schemas/monitor.schema';

const DEFAULT_BOT_USERNAME = 'pocketnote2vbot';

const PLACEHOLDER_CHAT_IDS = new Set([
  '',
  'your_chat_id',
  'your-chat-id',
  'changeme',
  'placeholder',
  '123456789',
]);

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private bot: TelegramBot | null = null;
  private adminChatId: string | null = null;
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @InjectModel(Monitor.name) private monitorModel: Model<MonitorDocument>,
  ) {}

  onModuleInit() {
    this.initBot();
  }

  onModuleDestroy() {
    if (this.bot) {
      try {
        void this.bot.stopPolling();
        this.logger.log('Telegram bot polling stopped');
      } catch (err) {
        this.logger.warn('Error stopping Telegram polling', err);
      }
    }
  }

  private initBot() {
    const token =
      this.configService.get<string>('TELEGRAM_TOKEN') ??
      this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    const rawAdminChatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
    if (rawAdminChatId && !PLACEHOLDER_CHAT_IDS.has(rawAdminChatId.trim().toLowerCase())) {
      this.adminChatId = rawAdminChatId.trim();
    }

    if (!token) {
      this.logger.error('Telegram bot token is missing.');
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });
      this.logger.log(`Telegram bot initialized with polling enabled`);

      this.bot.on('polling_error', (error: any) => {
        this.logger.warn(`Telegram polling warning: ${error?.message || error}`);
      });

      this.bot.on('message', async (msg) => {
        try {
          await this.handleIncomingMessage(msg);
        } catch (err: any) {
          this.logger.error('Error handling Telegram message', err?.message);
        }
      });
    } catch (err: any) {
      this.logger.error('Failed to initialize Telegram bot', err?.message);
    }
  }

  private async handleIncomingMessage(msg: any) {
    if (!msg.text) return;
    const text = msg.text.trim();
    const chatId = msg.chat.id.toString();
    const username = msg.from?.username || msg.from?.first_name || '';

    // Handle /start command (supports /start link_<userId> or /start <userId>)
    if (text.startsWith('/start')) {
      const parts = text.split(/\s+/);
      const param = parts[1]?.trim();

      if (param) {
        const userId = param.replace(/^link_/, '');
        try {
          const user = await this.usersService.findById(userId);
          if (user) {
            await this.usersService.linkTelegram(user._id.toString(), chatId, username);

            const welcomeMsg =
              `🎉 <b>Вітаємо, ${this.escapeHtml(user.name || 'користувач')}!</b>\n\n` +
              `Ваш акаунт <b>${this.escapeHtml(user.email)}</b> успішно підключено до <b>SiteMonitor</b>! 🚀\n\n` +
              `🔔 Тепер ви будете миттєво отримувати сповіщення, якщо якийсь із ваших сайтів стане недоступним або відновить роботу.\n\n` +
              `💡 Натисніть <b>Тест</b> на панелі моніторингу або введіть /status прямо тут для перегляду сайтів.`;

            await this.sendToChat(chatId, welcomeMsg);
            return;
          }
        } catch (e: any) {
          this.logger.error(`Failed to link Telegram user: ${e?.message}`);
        }
      }

      // Check if user is already linked by chatId
      const existingUser = await this.usersService.findByTelegramChatId(chatId);
      if (existingUser) {
        const greeting =
          `👋 <b>Привіт, ${this.escapeHtml(existingUser.name || 'користувач')}!</b>\n\n` +
          `Ваш Telegram вже підключено до акаунту <b>${this.escapeHtml(existingUser.email)}</b>.\n\n` +
          `🔹 Напишіть /status — щоб переглянути статус усіх ваших сайтів.\n` +
          `🔹 Напишіть /help — для списку доступних команд.`;
        await this.sendToChat(chatId, greeting);
        return;
      }

      // Default start greeting with instructions and Chat ID
      const defaultStart =
        `👋 <b>Привіт! Я офіційний бот SiteMonitor.</b>\n\n` +
        `Ваш Telegram Chat ID: <code>${chatId}</code>\n\n` +
        `🔹 <b>Як підключити сповіщення:</b>\n` +
        `1. Перейдіть на панель моніторингу SiteMonitor\n` +
        `2. Натисніть кнопку «Підключити Telegram» у шапці сайту\n` +
        `3. Натисніть кнопку швидкого підключення або введіть цей Chat ID у профілі.\n\n` +
        `Після підключення бот буде надсилати сповіщення саме про ваші сайти!`;

      await this.sendToChat(chatId, defaultStart);
      return;
    }

    // Handle /status command
    if (text === '/status') {
      const user = await this.usersService.findByTelegramChatId(chatId);
      if (!user) {
        await this.sendToChat(
          chatId,
          `⚠️ Цей чат ще не прив'язано до жодного акаунту SiteMonitor.\n\n` +
          `Ваш Chat ID: <code>${chatId}</code>\n` +
          `Підключіть його у вашому особистому кабінеті SiteMonitor.`,
        );
        return;
      }

      const monitors = await this.monitorModel.find({
        userId: user._id.toString(),
      });

      if (monitors.length === 0) {
        await this.sendToChat(
          chatId,
          `📊 <b>SiteMonitor — Моніторинг</b>\n` +
          `Акаунт: <b>${this.escapeHtml(user.name || user.email)}</b>\n\n` +
          `<i>У вас ще немає доданих сайтів. Додайте їх на сайті, щоб почати моніторинг!</i>`,
        );
        return;
      }

      let report =
        `📊 <b>SiteMonitor — Ваші сайти (${monitors.length}):</b>\n` +
        `Акаунт: <b>${this.escapeHtml(user.name || user.email)}</b>\n\n`;

      for (const m of monitors) {
        const isUp = m.lastStatus === 'up';
        const icon = isUp ? '🟢' : m.lastStatus === 'down' ? '🔴' : '⚪';
        const statusText = isUp
          ? 'Активний'
          : m.lastStatus === 'down'
          ? 'Недоступний'
          : 'Очікує перевірки';

        report += `${icon} <b>${this.escapeHtml(m.name)}</b>\n`;
        report += `🔗 ${this.escapeHtml(m.url)}\n`;
        report += `Статус: ${statusText} | Інтервал: ${m.interval || 5} хв\n\n`;
      }

      await this.sendToChat(chatId, report);
      return;
    }

    // Handle /help command
    if (text === '/help') {
      const helpMsg =
        `ℹ️ <b>Команди SiteMonitor бота:</b>\n\n` +
        `• /status — перевірити статус усіх ваших сайтів\n` +
        `• /start — інформація про підключення та ваш Chat ID\n` +
        `• /help — ця довідка`;
      await this.sendToChat(chatId, helpMsg);
    }
  }

  public async sendToChat(chatId: string | number, message: string): Promise<boolean> {
    if (!this.bot || !chatId) {
      return false;
    }

    try {
      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      });
      return true;
    } catch (error: any) {
      this.logger.error(
        `Telegram sendMessage error for chatId=${chatId}: ${error?.message || error}`,
      );
      return false;
    }
  }

  async sendAlert(
    monitorName: string,
    url: string,
    error: string,
    responseTime?: number,
    userId?: string,
  ) {
    let targetChatId = this.adminChatId;

    if (userId) {
      try {
        const user = await this.usersService.findById(userId);
        if (user) {
          if (user.notifyOnDown === false) {
            return;
          }
          if (user.telegramChatId) {
            targetChatId = user.telegramChatId;
          }
        }
      } catch (err: any) {
        this.logger.warn(`Could not resolve user for alert: ${err?.message}`);
      }
    }

    if (!targetChatId) {
      return;
    }

    const time = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });
    const pingLine =
      responseTime != null ? `\n<b>Останній пінг:</b> ${responseTime} мс` : '';

    const message =
      `🚨 <b>Сайт недоступний!</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `<b>📌 Назва:</b> ${this.escapeHtml(monitorName)}\n` +
      `<b>🔗 URL:</b> ${this.escapeHtml(url)}\n` +
      `<b>❌ Помилка:</b> ${this.escapeHtml(error)}${pingLine}\n` +
      `<b>🕐 Час:</b> ${time}\n\n` +
      `<i>Перевірте сервер або налаштування DNS.</i>`;

    await this.sendToChat(targetChatId, message);
  }

  async sendRecovery(
    monitorName: string,
    url: string,
    responseTime: number,
    userId?: string,
  ) {
    let targetChatId = this.adminChatId;

    if (userId) {
      try {
        const user = await this.usersService.findById(userId);
        if (user) {
          if (user.notifyOnRecovery === false) {
            return;
          }
          if (user.telegramChatId) {
            targetChatId = user.telegramChatId;
          }
        }
      } catch (err: any) {
        this.logger.warn(`Could not resolve user for recovery: ${err?.message}`);
      }
    }

    if (!targetChatId) {
      return;
    }

    const time = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });

    const message =
      `✅ <b>Сайт знову працює!</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `<b>📌 Назва:</b> ${this.escapeHtml(monitorName)}\n` +
      `<b>🔗 URL:</b> ${this.escapeHtml(url)}\n` +
      `<b>⚡ Пінг:</b> ${responseTime} мс\n` +
      `<b>🕐 Час:</b> ${time}`;

    await this.sendToChat(targetChatId, message);
  }

  getBotUsername(): string {
    const raw =
      this.configService.get<string>('TELEGRAM_BOT_USERNAME') ??
      DEFAULT_BOT_USERNAME;
    return raw.replace(/^@/, '');
  }

  async getStatus(userId?: string) {
    const botUsername = this.getBotUsername();
    let userConnected = false;
    let userChatId: string | null = null;
    let telegramUsername: string | null = null;

    if (userId) {
      try {
        const user = await this.usersService.findById(userId);
        if (user && user.telegramChatId) {
          userConnected = true;
          userChatId = user.telegramChatId;
          telegramUsername = user.telegramUsername || null;
        }
      } catch {
        // ignore
      }
    }

    return {
      configured: !!this.bot,
      botUsername,
      botUrl: `https://t.me/${botUsername}`,
      deepLink: userId
        ? `https://t.me/${botUsername}?start=link_${userId}`
        : `https://t.me/${botUsername}`,
      userConnected,
      userChatId,
      telegramUsername,
    };
  }

  async sendTestMessage(userId?: string) {
    if (!this.bot) {
      return { ok: false, message: 'Telegram бот не налаштовано на сервері' };
    }

    if (userId) {
      const user = await this.usersService.findById(userId);
      if (!user) {
        return { ok: false, message: 'Користувача не знайдено' };
      }

      if (!user.telegramChatId) {
        const botUsername = this.getBotUsername();
        return {
          ok: false,
          message:
            'Telegram ще не підключено. Натисніть «Підключити Telegram», щоб прив\'язати бот.',
          botUrl: `https://t.me/${botUsername}?start=link_${userId}`,
        };
      }

      const message =
        `🔔 <b>Тестове сповіщення SiteMonitor</b>\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `Привіт, <b>${this.escapeHtml(user.name || 'Користувач')}</b>!\n` +
        `Telegram успішно підключено до вашого облікового запису (<b>${this.escapeHtml(user.email)}</b>). 🎉\n\n` +
        `Тепер ви вчасно отримуватимете персональні сповіщення про доступність ваших сайтів!`;

      const sent = await this.sendToChat(user.telegramChatId, message);
      if (!sent) {
        return {
          ok: false,
          message:
            'Не вдалося надіслати повідомлення. Переконайтеся, що ви відкрили бота і натиснули Start.',
        };
      }

      return {
        ok: true,
        message: 'Тестове повідомлення успішно надіслано у ваш Telegram!',
      };
    }

    if (this.adminChatId) {
      const message =
        `🔔 <b>Тестове сповіщення SiteMonitor</b>\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `Системний Telegram бот налаштовано успішно!`;
      await this.sendToChat(this.adminChatId, message);
      return { ok: true, message: 'Тестове повідомлення надіслано в системний чат' };
    }

    return {
      ok: false,
      message: 'Telegram не підключено для вашого акаунту.',
    };
  }

  async connectChatId(userId: string, rawChatId: string) {
    const trimmed = rawChatId?.toString().trim();
    if (!trimmed) {
      return { ok: false, message: 'Введіть коректний Chat ID' };
    }

    const updated = await this.usersService.linkTelegram(userId, trimmed);
    if (!updated) {
      return { ok: false, message: 'Користувача не знайдено' };
    }

    const confirmation =
      `🎉 <b>SiteMonitor підключено!</b>\n\n` +
      `Ваш Telegram Chat ID успішно прив'язано до акаунту <b>${this.escapeHtml(updated.email)}</b>. ` +
      `Тепер сповіщення про сайти приходитимуть сюди!`;

    void this.sendToChat(trimmed, confirmation);

    return {
      ok: true,
      message: 'Telegram успішно підключено!',
      chatId: trimmed,
    };
  }

  async disconnectUser(userId: string) {
    await this.usersService.disconnectTelegram(userId);
    return { ok: true, message: 'Telegram успішно відключено' };
  }

  private escapeHtml(text: string): string {
    return (text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
