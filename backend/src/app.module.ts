import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { UsersModule } from './modules/users/users.module';
import { RoutesModule } from './modules/routes/routes.module';
import { RouteTemplatesModule } from './modules/route-templates/route-templates.module';
import { TripsModule } from './modules/trips/trips.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { ClientsModule } from './modules/clients/clients.module';
import { PackagesModule } from './modules/packages/packages.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { BoxCutoffsModule } from './modules/box-cutoffs/box-cutoffs.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { StopsModule } from './modules/stops/stops.module';
import { SupabaseModule } from './shared/supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    SupabaseModule,
    AuthModule,
    InvitationsModule,
    CompaniesModule,
    UsersModule,
    StopsModule,
    RoutesModule,
    RouteTemplatesModule,
    TripsModule,
    ReservationsModule,
    ClientsModule,
    PackagesModule,
    TransactionsModule,
    BoxCutoffsModule,
    VehiclesModule,
    ExpensesModule,
    CommissionsModule,
    ReportsModule,
    AuditLogsModule,
    NotificationsModule,
  ],
})
export class AppModule {}

