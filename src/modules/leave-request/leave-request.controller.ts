import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe, Query } from '@nestjs/common';
import { LeaveRequestService } from './leave-request.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from 'src/common/exceptions/api-response';

@Controller('leave-request')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createLeaveRequestDto: CreateLeaveRequestDto, @Req() req) {
    if (req.user.role !== 'USER') {
      return ApiResponse.unauthorized('Unauthorized access')
    }
    // Need to Validate that the leave request date is already requested.
    const leave = this.leaveRequestService.create(req.user.employeeId, createLeaveRequestDto);
    return ApiResponse.success(leave, 'Leave Created Successfully', 200)
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
    @Req() req) {
    let leaveList;
    if (req.user.role === 'ADMIN') {
      leaveList = await this.leaveRequestService.findByAdmin({ limit, offset })
    } else if (req.user.role === 'CLIENT') {
      leaveList = await this.leaveRequestService.findByCompany({ companyId: req.user.companyId, limit, offset })
    } else {
      leaveList = await this.leaveRequestService.findByEmployee({ employeeId: req.user.employeeId, limit, offset })
    }
    return ApiResponse.success(leaveList, "Leave Data retrieved successfully", 200)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const leave = await this.leaveRequestService.findOne(id);
    return ApiResponse.success(leave, "Leave Data retrived successfully", 200)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLeaveRequestDto: UpdateLeaveRequestDto) {
    return await this.leaveRequestService.update(+id, updateLeaveRequestDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const leave = await this.leaveRequestService.remove(id);
    return ApiResponse.success(leave, "Leave Data deleted successfully", 200)
  }
}
