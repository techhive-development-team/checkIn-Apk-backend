import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';
import { IsOptional } from 'class-validator/types/decorator/common/IsOptional';
import { IsString } from 'class-validator';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {

  @IsOptional()
  @IsString()
  status?: string;

}
