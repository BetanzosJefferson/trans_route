import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crear invitación (solo SuperAdmin)' })
  @ApiResponse({ status: 201, description: 'Invitación creada exitosamente' })
  create(
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.invitationsService.create(userId, createInvitationDto.email);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Listar todas las invitaciones creadas' })
  findAll(@CurrentUser('id') userId: string) {
    return this.invitationsService.findAll(userId);
  }

  @Get('validate/:token')
  @Public()
  @ApiOperation({ summary: 'Validar token de invitación (público)' })
  @ApiResponse({ status: 200, description: 'Token válido' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  validateToken(@Param('token') token: string) {
    return this.invitationsService.validateToken(token);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Eliminar invitación' })
  remove(@Param('id') id: string) {
    return this.invitationsService.delete(id);
  }
}

