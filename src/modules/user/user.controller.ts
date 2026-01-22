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
  UnauthorizedException,
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
  create(@Body() createUserDto: CreateUserDto, @Req() req) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Unauthorized access');
    }
    const user = this.userService.create(createUserDto);
    return ApiResponse.success(user, 'User created successfully', 201);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Unauthorized access');
    }
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  findOne(@Param('userId') userId: string, @Req() req) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Unauthorized access');
    }
    return this.userService.findOne(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Unauthorized access');
    }
    return this.userService.update(userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':userId')
  remove(
    @Param('userId') userId: string,
    @Req() req) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Unauthorized access');
    }
    return this.userService.remove(userId);
  }
}
