import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class AiRequestDto {
  prompt: string;
  systemPrompt?: string;
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('generate')
  async generate(@Body() dto: AiRequestDto) {
    const text = await this.aiService.generate(dto.prompt, dto.systemPrompt);
    return { text };
  }
}
