import { IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {

  @IsNotEmpty()
  public currentPassword: string;

  @IsNotEmpty()
  public newPassword: string;
}
