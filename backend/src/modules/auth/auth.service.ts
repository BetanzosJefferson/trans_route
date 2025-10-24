import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { InvitationsService } from '../invitations/invitations.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterByInvitationDto } from './dto/register-by-invitation.dto';
import { UserRole } from '../../shared/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private invitationsService: InvitationsService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Destructure to remove password from the data being sent
    const { password, ...userDataWithoutPassword } = registerDto;

    const user = await this.usersService.create({
      ...userDataWithoutPassword,
      password_hash: hashedPassword,
    });

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      access_token: token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findOne(userId);
    
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return this.sanitizeUser(user);
  }

  private generateToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    };

    return this.jwtService.sign(payload);
  }

  async registerByInvitation(registerDto: RegisterByInvitationDto) {
    // Validate invitation token
    await this.invitationsService.validateToken(registerDto.token);

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create company first
    const company = await this.companiesService.create({
      name: registerDto.company_name,
      logo_url: registerDto.company_logo_url,
      is_active: true,
    });

    // Create user as owner of the company
    const user = await this.usersService.create({
      first_name: registerDto.first_name,
      last_name: registerDto.last_name,
      email: registerDto.email,
      password_hash: hashedPassword,
      phone: registerDto.phone,
      role: UserRole.OWNER,
      company_id: company.id,
      is_active: true,
    });

    // Mark invitation as used
    await this.invitationsService.markAsUsed(registerDto.token, user.id);

    // Generate token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      company,
      access_token: token,
    };
  }

  private sanitizeUser(user: any) {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}

