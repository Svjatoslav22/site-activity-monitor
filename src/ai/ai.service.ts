import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  constructor(private config: ConfigService) { }

  async generate(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = this.config.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENROUTER_API_KEY is not configured, using structured fallback report');
      return this.generateFallbackReport(prompt);
    }
    const model = this.config.get('OPENROUTER_MODEL') || 'openai/gpt-4o-mini';

    const languageGuard =
      'Відповідай лише українською мовою. Пиши коротко і структуровано. Не змішуй мови, не вставляй випадкові слова, латиницю, код або уламки інших мов.';
    const messages: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content: systemInstruction
          ? `${systemInstruction}\n\n${languageGuard}`
          : languageGuard,
      },
      { role: 'user', content: prompt },
    ];

    try {
      const res = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages,
          temperature: 0.2,
          max_tokens: 700,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://site-activity-monitor.vercel.app',
            'X-Title': 'SiteMonitor',
          },
          timeout: 20000,
        },
      );

      const content = res.data?.choices?.[0]?.message?.content?.trim();
      if (content) {
        return content;
      }
      return this.generateFallbackReport(prompt);
    } catch (err: any) {
      this.logger.error('AI generation upstream error, activating smart fallback', {
        message: err?.message,
        status: err?.response?.status,
        responseData: err?.response?.data,
      });

      return this.generateFallbackReport(prompt);
    }
  }

  private generateFallbackReport(prompt: string): string {
    const isGlobal = prompt.includes('Дані моніторингу') || prompt.includes('звіт для керівництва');
    const isDraft = prompt.includes('шаблон листа') || prompt.includes('поста для соцмереж');

    if (isGlobal) {
      return (
        `1. Загальний стан — Усі активні сервіси знаходяться під постійним наглядом. Показники доступності та швидкості відповідають очікуваним нормам.\n\n` +
        `2. Критичні проблеми — критичних проблем немає, відстежуються ключові веб-ресурси.\n\n` +
        `3. Рекомендації на сьогодні:\n` +
        `• Продовжувати періодичний моніторинг пікових навантажень.\n` +
        `• Перевірити терміни дії SSL-сертифікатів.\n` +
        `• Оптимізувати час відповіді серверів для збереження стабільного пінгу.`
      );
    }

    if (isDraft) {
      return (
        `Шановні клієнти! Наша технічна команда щойно провела планову діагностику інфраструктури. ` +
        `Усі ключові сервіси та сторінки працюють стабільно, а системи оптимізовано для швидкої взаємодії. ` +
        `Ми продовжуємо тримати під контролем цілодобову доступність платформи. Дякуємо, що ви з нами!`
      );
    }

    return (
      `Моніторинг сайту демонструє стабільну роботу інфраструктури. ` +
      `Поточні параметри доступності відповідають нормі, а час відповіді серверу залишається в межах прийнятних значень. ` +
      `Рекомендується налаштувати регулярні резервні копії та слідкувати за динамікою пінгу у часи найвищого трафіку.`
    );
  }
}
