import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from 'prisma/generated/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  create(createUserDto: CreateUserDto) {
    const data: Prisma.UserCreateInput = {
      email: createUserDto.email,
      password: createUserDto.password,
      ...(createUserDto.companyId && {
        company: {
          connect: { companyId: createUserDto.companyId },
        },
      }),
      ...(createUserDto.employeeId && {
        employee: {
          connect: { employeeId: createUserDto.employeeId },
        }
      })
    };
    return this.prisma.user.create({
      data
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
