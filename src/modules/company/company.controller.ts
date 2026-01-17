import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyFilterDto } from './dto/filter-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    const company = this.companyService.create(createCompanyDto);
    return {
      statusCode: 200,
      message: 'Company created successfully',
      data: company,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() filterDto: CompanyFilterDto, @Req() req) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can access this resource');
    }
    return this.companyService.findAll(filterDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    if (req.user.role == 'ADMIN' || req.user.companyId == id) {
      const company = this.companyService.findOne(id);
      return {
        statusCode: 200,
        message: 'Company retrieved successfully',
        data: company,
      }
    }
    throw new UnauthorizedException('You can only access your own company data');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto, @Req() req) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can access this resource');
    } else if (req.user.companyId !== id) {
      throw new UnauthorizedException('You can only access your own company data');
    }
    const updatedCompany = this.companyService.update(id, updateCompanyDto);
    return {
      statusCode: 200,
      message: 'Company updated successfully',
      data: updatedCompany,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can access this resource');
    }
    const company = this.companyService.remove(id);
    return {
      statusCode: 200,
      message: 'Company deleted successfully',
      data: company,
    };
  }
}
