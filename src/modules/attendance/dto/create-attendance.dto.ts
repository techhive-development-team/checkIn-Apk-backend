import { IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAttendanceDto {
    
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  checkInTime?: Date;

  @IsOptional()
  @IsString()
  checkInLocation?: string;

  @IsOptional()
  @IsString()
  checkInPhoto?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  checkOutTime?: Date;

  @IsOptional()
  @IsString()
  checkOutLocation?: string;

  @IsOptional()
  @IsString()
  checkOutPhoto?: string;
}
