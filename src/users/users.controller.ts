import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getProfile() {
    return this.usersService.getProfile();
  }

  @Patch()
  updateProfile(@Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(dto);
  }
}
