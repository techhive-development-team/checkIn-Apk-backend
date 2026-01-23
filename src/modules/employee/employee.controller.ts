import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) { }

  @UseGuards(JwtAuthGuard)
  @Post(':companyId')
  createByCompany(
    @Param('companyId') companyId: string,
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() req
  ) {
    if (req.user.role == 'CLIENT' && req.user.companyId !== companyId) {
      throw new UnauthorizedException('Unuthorized');
    }
    return this.employeeService.createByCompanyId(companyId, createEmployeeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findByCompanyId(
    @Query('companyId') companyId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
    @Req() req
  ) {
    if (req.user.role == 'CLIENT' && req.user.companyId !== companyId) {
      throw new UnauthorizedException('Unauthorized');
    }
    if (req.user.role == 'USER') {
      throw new UnauthorizedException('Unauthorized');
    }
    if (req.user.role == 'CLIENT') {
      return this.employeeService.findByCompanyId({ companyId, limit, offset });
    }
    if (req.user.role == 'ADMIN') {
      return this.employeeService.findAll({ limit, offset });
    }
  }

  @Get(':companyId/:employeeId')
  findOneByCompanyId(
    @Param('companyId') companyId: string,
    @Param('employeeId') employeeId: string,
    @Req() req
  ) {
    if (req.user.role == 'CLIENT' && req.user.companyId !== companyId) {
      throw new UnauthorizedException('Unauthorized');
    }
    if (req.user.role == 'USER' && req.user.employeeId !== employeeId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.employeeService.findOneByCompanyIdAndEmployeeId(companyId, employeeId);
  }

  @Patch(':companyId/:employeeId')
  updateByCompanyId(
    @Param('companyId') companyId: string,
    @Param('employeeId') employeeId: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Req() req
  ) {
    if (req.user.role == 'CLIENT' && req.user.companyId !== companyId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.employeeService.update(companyId, employeeId, updateEmployeeDto);
  }

  @Delete(':companyId/:employeeId')
  removeByCompanyId(
    @Param('companyId') companyId: string,
    @Param('employeeId') employeeId: string,
    @Req() req
  ) {
    if (req.user.role == 'CLIENT' && req.user.companyId !== companyId) {
      throw new UnauthorizedException('Unuthorized');
    }
    return this.employeeService.remove(companyId, employeeId);
  }

}
