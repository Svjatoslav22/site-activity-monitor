import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  constructor(private config: ConfigService) { }

  async generate(prompt: string, systemInstruction?: string) {
    try {
      const apiKey = this.config.get('OPENROUTER_API_KEY') || '';
      if (!apiKey) {
        throw new InternalServerErrorException('OPENROUTER_API_KEY is not configured on the server');
      }
      const model =
        this.config.get('OPENROUTER_MODEL') ||
        'meta-llama/llama-3.1-8b-instruct';
      const messages: Array<{ role: string; content: string }> = [];
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }
      messages.push({ role: 'user', content: prompt });
      const res = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages,
          max_tokens: 400, // короткі відповіді = дешевше
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
      return res.data?.choices?.[0]?.message?.content || null;
    } catch (err: any) {
      // Log useful details for debugging
      this.logger.error('AI generation error', {
        message: err?.message,
        status: err?.response?.status,
        responseData: err?.response?.data,
      });

      // If it's a known InternalServerErrorException thrown earlier, rethrow to preserve status
      if (err instanceof InternalServerErrorException) {
        throw err;
      }

      // Surface the upstream error message when available to the client for easier debugging
      const clientMsg = err?.response?.data?.error?.message || err?.message || 'AI generation failed';
      throw new InternalServerErrorException(`AI generation failed: ${clientMsg}`);
    }
  }
}
