import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email?.trim().toLowerCase();
    if (!email || !dto.password) {
      throw new BadRequestException('Будь ласка, заповніть email та пароль');
    }
    if (dto.password.length < 4) {
      throw new BadRequestException('Пароль має містити щонайменше 4 символи');
    }

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Користувач із такою електронною поштою вже зареєстрований');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser({
      email,
      password: hashed,
      name: dto.name?.trim() || 'Користувач',
    } as any);

    const payload = { sub: user._id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async validateUser(email: string, password: string) {
    const normalizedEmail = email?.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user || !user.password) return null;
    const passMatches = await bcrypt.compare(password, (user as any).password);
    if (!passMatches) return null;
    return user;
  }

  async login(dto: LoginDto) {
    const email = dto.email?.trim().toLowerCase();
    if (!email || !dto.password) {
      throw new BadRequestException('Будь ласка, введіть email та пароль');
    }

    const user = await this.validateUser(email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Невірний email або пароль');
    }
    const payload = { sub: user._id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        telegramChatId: (user as any).telegramChatId,
        telegramUsername: (user as any).telegramUsername,
      },
    };
  }
}
