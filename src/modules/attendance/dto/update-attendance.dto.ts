import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceDto } from './create-attendance.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {

  @IsOptional()
  @IsString()
  status?: string;
  
}
