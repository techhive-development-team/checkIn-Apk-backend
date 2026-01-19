import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, UnauthorizedException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @UseGuards(JwtAuthGuard)
  @Post(':employeeId')
  create(
    @Param('employeeId') employeeId: string,
    @Query('companyId') companyId: string,
    @Body() createAttendanceDto: CreateAttendanceDto,
    @Req() req
  ) {
    if (req.user.role == 'USER' && req.user.employeeId !== employeeId) {
      throw new UnauthorizedException('You are not authorized to create attendance for this employee');
    }
    if(req.user.role == 'CLIENT' && req.user.companyId !== companyId){
      throw new UnauthorizedException('You are not authorized to create attendance for this company');
    }
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.update(+id, updateAttendanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(+id);
  }
}
