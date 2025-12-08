import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
}

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class CreateUserDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  public password?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  public googleId?: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(UserRole)
  public role: string;

  @IsString()
  @IsOptional()
  @IsEnum(UserStatus)
  public status?: string;

  @IsString()
  @IsOptional()
  public companyId?: string;

  @IsString()
  @IsOptional()
  public employeeId?: string;
}