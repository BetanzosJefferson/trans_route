import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CommissionsService } from './commissions.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('commissions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Post()
  create(@Body() data: any) {
    return this.commissionsService.create(data);
  }

  @Get()
  findAll(@Query('company_id') companyId: string) {
    return this.commissionsService.findAll(companyId);
  }

  @Get('logs')
  getCommissionLogs(@Query('company_id') companyId: string, @Query('user_id') userId?: string) {
    return this.commissionsService.getCommissionLogs(companyId, userId);
  }
}

