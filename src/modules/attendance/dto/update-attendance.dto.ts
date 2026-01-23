import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceDto } from './create-attendance.dto';
import { IsString } from 'class-validator/types/decorator/typechecker/IsString';
import { IsOptional } from 'class-validator/types/decorator/common/IsOptional';

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {

  @IsOptional()
  @IsString()
  status?: string;
  
}
