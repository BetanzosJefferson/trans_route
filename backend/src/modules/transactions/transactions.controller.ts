import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('transactions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() data: any) {
    return this.transactionsService.create(data);
  }

  @Get()
  findAll(@Query('company_id') companyId: string, @Query() filters: any) {
    return this.transactionsService.findAll(companyId, filters);
  }
}

