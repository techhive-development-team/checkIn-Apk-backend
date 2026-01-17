
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class EmployeeFilterDto {

    @IsOptional()
    @Type(() => Number)
    @IsPositive()
    limit?: number;

    @IsOptional()
    @Type(() => Number)
    @Min(0)
    offset?: number;

}