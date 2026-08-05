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

  async createUser(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data as any);
  }
}
