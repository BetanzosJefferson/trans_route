import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvitationsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(userId: string, email?: string) {
    const supabase = this.supabaseService.getServiceClient();

    // Generate unique token
    const token = uuidv4();
    
    // Token expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data, error } = await supabase
      .from('invitations')
      .insert([{
        token,
        email,
        created_by_user_id: userId,
        expires_at: expiresAt.toISOString(),
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating invitation: ${error.message}`);
    }

    return {
      ...data,
      invitation_link: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/register/invite/${token}`,
    };
  }

  async findAll(userId: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('created_by_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching invitations: ${error.message}`);
    }

    return data.map(invitation => ({
      ...invitation,
      invitation_link: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/register/invite/${invitation.token}`,
    }));
  }

  async validateToken(token: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !data) {
      throw new NotFoundException('Invitación no encontrada');
    }

    // Check if already used
    if (data.is_used) {
      throw new BadRequestException('Esta invitación ya ha sido utilizada');
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    
    if (now > expiresAt) {
      throw new BadRequestException('Esta invitación ha expirado');
    }

    return {
      valid: true,
      email: data.email,
    };
  }

  async markAsUsed(token: string, userId: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('invitations')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        used_by_user_id: userId,
      })
      .eq('token', token)
      .select()
      .single();

    if (error) {
      throw new Error(`Error marking invitation as used: ${error.message}`);
    }

    return data;
  }

  async delete(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting invitation: ${error.message}`);
    }

    return { message: 'Invitación eliminada exitosamente' };
  }
}

