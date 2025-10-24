import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BoxCutoffsService } from './box-cutoffs.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('box-cutoffs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('box-cutoffs')
export class BoxCutoffsController {
  constructor(private readonly boxCutoffsService: BoxCutoffsService) {}

  @Post()
  create(@Body() data: any, @CurrentUser('id') userId: string) {
    return this.boxCutoffsService.create(data, userId);
  }

  @Get()
  findAll(@Query('company_id') companyId: string) {
    return this.boxCutoffsService.findAll(companyId);
  }
}

