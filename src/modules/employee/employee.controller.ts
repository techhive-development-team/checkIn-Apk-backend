import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from 'src/common/exceptions/api-response';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) { }

  @UseGuards(JwtAuthGuard)
  @Post(':companyId')
  async createByCompany(
    @Param('companyId') companyId: string,
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() req
  ) {
    if (req.user.role === 'ADMIN' || req.user.role === 'USER') {
      return ApiResponse.unauthorized('Unuthorized');
    }
    if (req.user.role == 'CLIENT' && req.user.companyId !== companyId) {
      return ApiResponse.unauthorized('Unuthorized');
    }
    const employee = await this.employeeService.createByCompanyId(companyId, createEmployeeDto);
    return ApiResponse.success(employee, 'Employee created successfully', 201);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findByCompanyId(
    @Query('companyId') companyId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
    @Req() req
  ) {
    if (req.user.role == 'CLIENT' && req.user.companyId !== companyId) {
      return ApiResponse.unauthorized('Unauthorized');
    }
    if (req.user.role == 'USER') {
      return ApiResponse.unauthorized('Unauthorized');
    }
    let employees;
    if (req.user.role == 'CLIENT') {
      employees = await this.employeeService.findByCompanyId({ companyId, limit, offset });
    }
    if (req.user.role == 'ADMIN') {
      employees = await this.employeeService.findAll({ limit, offset });
    }
    return ApiResponse.success(employees, 'Employees retrieved successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':companyId/:employeeId')
  async findOneByCompanyId(
    @Param('companyId') companyId: string,
    @Param('employeeId') employeeId: string,
    @Req() req
  ) {
    if (req.user.role == 'CLIENT' && req.user.companyId !== companyId) {
      return ApiResponse.unauthorized('Unauthorized');
    }
    if (req.user.role == 'USER' && req.user.employeeId !== employeeId) {
      return ApiResponse.unauthorized('Unauthorized');
    }
    const employee = await this.employeeService.findOneByCompanyIdAndEmployeeId(companyId, employeeId);
    return ApiResponse.success(employee, 'Employee retrieved successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':companyId/:employeeId')
  async updateByCompanyId(
    @Param('companyId') companyId: string,
    @Param('employeeId') employeeId: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Req() req
  ) {
    if (req.user.role == 'CLIENT' && req.user.companyId !== companyId) {
      return ApiResponse.unauthorized('Unauthorized');
    }
    if (req.user.role == 'USER' && req.user.employeeId !== employeeId) {
      return ApiResponse.unauthorized('Unauthorized');
    }
    const employee = await this.employeeService.update(companyId, employeeId, updateEmployeeDto);
    return ApiResponse.success(employee, 'Employee updated successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':companyId/:employeeId')
  async removeByCompanyId(
    @Param('companyId') companyId: string,
    @Param('employeeId') employeeId: string,
    @Req() req
  ) {
    if (req.user.role == 'CLIENT' && req.user.companyId !== companyId) {
      return ApiResponse.unauthorized('Unuthorized');
    }
    const employee = await this.employeeService.remove(companyId, employeeId);
    return ApiResponse.success(employee, 'Employee deleted successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':companyId/:employeeId/password-reset')
  async passwordReset(
    @Param('companyId') companyId: string,
    @Param('employeeId') employeeId: string,
    @Req() req) {
    if (req.user.role == 'CLIENT' && req.user.companyId !== companyId) {
      return ApiResponse.unauthorized('Unuthorized');
    }
    const user = ''
    return ApiResponse.success(user, 'Password reset successfully');
  }

}
