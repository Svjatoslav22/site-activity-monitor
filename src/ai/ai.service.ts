import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  constructor(private config: ConfigService) {}

  async generate(prompt: string, systemInstruction?: string) {
    try {
      const payload: any = {
        contents: [{ parts: [{ text: prompt }] }],
      };

      if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const apiKey = this.config.get('GEMINI_API_KEY') || '';
      if (!apiKey) {
        throw new InternalServerErrorException('GEMINI_API_KEY is not configured on the server');
      }
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const res = await axios.post(apiUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000,
      });

      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || null;
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
