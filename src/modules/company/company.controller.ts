import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyFilterDto } from './dto/filter-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from 'src/common/exceptions/api-response';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() filterDto: CompanyFilterDto, @Req() req) {
    if (req.user.role !== 'ADMIN') {
      return ApiResponse.unauthorized('Only admins can access this resource');
    }
    const companies = await this.companyService.findAll(filterDto);
    return ApiResponse.success(companies, 'Companies retrieved successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    if (req.user.role == 'ADMIN' || (req.user.role == 'CLIENT' && req.user.companyId == id)) {
      const company = await this.companyService.findOne(id);
      return ApiResponse.success(company, 'Company retrieved successfully');
    }
    return ApiResponse.unauthorized('You can only access your own company data');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Req() req,
  ) {
    if (req.user.role == 'ADMIN' || (req.user.role == 'CLIENT' && req.user.companyId == id)) {
      const company = await this.companyService.update(id, updateCompanyDto);
      return ApiResponse.success(company, 'Company updated successfully');
    }
    return ApiResponse.unauthorized('You can only access your own company data');
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    if (req.user.role !== 'ADMIN') {
      return ApiResponse.unauthorized('Only admins can access this resource');
    }
    const company = await this.companyService.remove(id);
    return ApiResponse.success(company, 'Company deleted successfully');
  }
}
