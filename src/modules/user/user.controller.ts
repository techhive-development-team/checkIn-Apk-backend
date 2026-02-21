import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse } from 'src/common/exceptions/api-response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Req() req) {
    if (req.user.systemRole !== 'SUPER_ADMIN') {
      return ApiResponse.unauthorized('Unauthorized access');
    }
    const user = await this.userService.createAdmin(createUserDto);
    return ApiResponse.success(user, 'User created successfully', 201);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    if (req.user.systemRole !== 'SUPER_ADMIN') {
      return ApiResponse.unauthorized('Unauthorized access');
    }
    const users = await this.userService.findAll();
    return ApiResponse.success(users, 'Users retrieved successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async findOne(@Param('userId') userId: string, @Req() req) {
    if (req.user.systemRole == 'SUPER_ADMIN' || (req.user.systemRole == 'COMPANY_OWNER' && req.user.userId == userId)) {
      const user = await this.userService.findOne(userId);
      return ApiResponse.success(user, 'User retrieved successfully');
    }
    return ApiResponse.unauthorized('You can only access your own data');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  async update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req) {
    if (req.user.systemRole !== 'SUPER_ADMIN') {
      return ApiResponse.unauthorized('Unauthorized access');
    }
    const user = await this.userService.update(userId, updateUserDto);
    return ApiResponse.success(user, 'User updated successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':userId')
  async remove(
    @Param('userId') userId: string,
    @Req() req) {
    if (req.user.systemRole !== 'SUPER_ADMIN') {
      return ApiResponse.unauthorized('Unauthorized access');
    }
    const user = await this.userService.remove(userId);
    return ApiResponse.success(user, 'User deleted successfully');
  }
}
