import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('reports')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('financial')
  @ApiOperation({ summary: 'Reporte financiero por rango de fechas' })
  getFinancialReport(
    @Query('company_id') companyId: string,
    @Query('from_date') fromDate: string,
    @Query('to_date') toDate: string,
  ) {
    return this.reportsService.getFinancialReport(companyId, fromDate, toDate);
  }

  @Get('sales')
  @ApiOperation({ summary: 'Reporte de ventas por rango de fechas' })
  getSalesReport(
    @Query('company_id') companyId: string,
    @Query('from_date') fromDate: string,
    @Query('to_date') toDate: string,
  ) {
    return this.reportsService.getSalesReport(companyId, fromDate, toDate);
  }
}

