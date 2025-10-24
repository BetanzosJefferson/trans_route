import { PartialType } from '@nestjs/swagger';
import { CreateRouteTemplateDto } from './create-route-template.dto';

export class UpdateRouteTemplateDto extends PartialType(CreateRouteTemplateDto) {}

