import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe, Query } from '@nestjs/common';
import { LeaveRequestService } from './leave-request.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from 'src/common/exceptions/api-response';
import { CustomUnauthorizedException } from 'src/common/exceptions/custom.exceptions';

@Controller('leave-request')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createLeaveRequestDto: CreateLeaveRequestDto, @Req() req) {
    if (req.user.role !== 'USER') {
      return ApiResponse.unauthorized('Unauthorized access')
    }
    const leave = this.leaveRequestService.create(req.user.employeeId, createLeaveRequestDto);
    return ApiResponse.success(leave, 'Leave Created Successfully', 200)
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Req() req,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('employeeId') employeeId?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0) {
    let leaveList;
    if (req.user.role === 'ADMIN') {
      leaveList = await this.leaveRequestService.findByAdmin({ employeeId, fromDate, toDate, limit, offset })
    } else if (req.user.role === 'CLIENT') {
      leaveList = await this.leaveRequestService.findByCompany({ companyId: req.user.companyId, employeeId, fromDate, toDate, limit, offset })
    } else {
      leaveList = await this.leaveRequestService.findByEmployee({ employeeId: req.user.employeeId, fromDate, toDate, limit, offset })
    }
    return ApiResponse.success(leaveList, "Leave Data retrieved successfully", 200)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const leave = await this.leaveRequestService.findOne(id);
    this.authorizeUpdateAndDelete(leave, req.user);
    return ApiResponse.success(leave, "Leave Data retrived successfully", 200)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
    @Req() req,
  ) {
    const leave = await this.leaveRequestService.findOne(id);
    this.authorizeUpdateAndDelete(leave, req.user);
    return this.leaveRequestService.update(id, updateLeaveRequestDto);
  }

  private authorizeUpdateAndDelete(leave, user) {
    if (user.role === 'CLIENT' && leave.employee.companyId !== user.companyId) {
      throw new CustomUnauthorizedException('You are not allowed to update this leave request');
    }
    if (user.role === 'USER' && leave.employeeId !== user.employeeId) {
      throw new CustomUnauthorizedException('You are not allowed to update this leave request');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const leave = await this.leaveRequestService.findOne(id);
    this.authorizeUpdateAndDelete(leave, req.user);
    const deletedLeave = await this.leaveRequestService.remove(id);
    return ApiResponse.success(deletedLeave, "Leave Data deleted successfully", 200)
  }
}
