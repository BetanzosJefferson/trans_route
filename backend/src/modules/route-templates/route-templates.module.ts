import { Module } from '@nestjs/common';
import { RouteTemplatesController } from './route-templates.controller';
import { RouteTemplatesService } from './route-templates.service';

@Module({
  controllers: [RouteTemplatesController],
  providers: [RouteTemplatesService],
  exports: [RouteTemplatesService],
})
export class RouteTemplatesModule {}

