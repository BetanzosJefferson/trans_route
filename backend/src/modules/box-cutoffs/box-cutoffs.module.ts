import { Module } from '@nestjs/common';
import { BoxCutoffsController } from './box-cutoffs.controller';
import { BoxCutoffsService } from './box-cutoffs.service';

@Module({
  controllers: [BoxCutoffsController],
  providers: [BoxCutoffsService],
})
export class BoxCutoffsModule {}

