import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PackagesService } from './packages.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('packages')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  create(@Body() data: any) {
    return this.packagesService.create(data);
  }

  @Get()
  findAll(@Query('company_id') companyId: string) {
    return this.packagesService.findAll(companyId);
  }
}

