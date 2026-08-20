import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
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
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const res = await axios.post(apiUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000,
      });

      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || null;
    } catch (err) {
      throw new InternalServerErrorException('AI generation failed');
    }
  }
}
