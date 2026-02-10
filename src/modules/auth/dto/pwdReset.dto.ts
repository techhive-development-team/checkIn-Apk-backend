import { IsNotEmpty, MinLength } from 'class-validator';

export class PasswordResetDto {
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword: string;

  @IsNotEmpty()
  token: string;
}
