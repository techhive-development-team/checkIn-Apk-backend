import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) { }

  // @Get('')

  @Post(':companyId')
  createByCompany(
    @Param('companyId') companyId: string,
    @Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.createByCompanyId(companyId, createEmployeeDto);
  }

  @Get(':companyId')
  findByCompanyId(
    @Param('companyId') companyId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
  ) {
    return this.employeeService.findByCompanyId({ companyId, limit, offset });
  }

  @Get(':companyId/:employeeId')
  findOneByCompanyId(
    @Param('companyId') companyId: string,
    @Param('employeeId') employeeId: string) {
    return this.employeeService.findOneByCompanyIdAndEmployeeId(companyId, employeeId);
  }

  @Patch(':companyId/:employeeId')
  updateByCompanyId(
    @Param('companyId') companyId: string,
    @Param('employeeId') employeeId: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeService.update(companyId, employeeId, updateEmployeeDto);
  }

  @Delete(':companyId/:employeeId')
  removeByCompanyId(
    @Param('companyId') companyId: string,
    @Param('employeeId') employeeId: string) {
    return this.employeeService.remove(companyId, employeeId);
  }

}
