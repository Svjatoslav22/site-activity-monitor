export class UpdateProfileDto {
  name?: string;
  email?: string;
  telegramUsername?: string;
  telegramChatId?: string;
  notifyOnDown?: boolean;
  notifyOnRecovery?: boolean;
}
