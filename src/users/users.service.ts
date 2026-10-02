import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getProfile(): Promise<UserDocument> {
    let user = await this.userModel.findOne();
    if (!user) {
      user = await this.userModel.create({ name: 'Користувач' });
    }
    return user;
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(userId, dto, { new: true });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findByTelegramChatId(chatId: string): Promise<UserDocument | null> {
    if (!chatId) return null;
    return this.userModel.findOne({ telegramChatId: chatId.toString() }).exec();
  }

  async linkTelegram(
    userId: string,
    chatId: string,
    username?: string,
  ): Promise<UserDocument | null> {
    const updateData: Partial<User> = {
      telegramChatId: chatId.toString(),
    };
    if (username) {
      updateData.telegramUsername = username.replace(/^@/, '');
    }
    return this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
  }

  async disconnectTelegram(userId: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { telegramChatId: '', telegramUsername: '' },
      { new: true },
    );
  }

  async createUser(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data as any);
  }
}
