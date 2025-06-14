
import { supabase } from '@/integrations/supabase/client';

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  user_role?: 'owner' | 'admin' | 'member';
  member_count?: number;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  invited_by?: string;
  joined_at: string;
  created_at: string;
  profiles?: {
    name: string;
    email: string;
  };
}

export interface CreateOrganizationData {
  name: string;
  description?: string;
}

export interface InviteOrganizationMemberData {
  email: string;
  role: 'admin' | 'member';
}

export interface UserPermission {
  id: string;
  user_id: string;
  organization_id: string;
  permission: string;
  granted_by?: string;
  created_at: string;
}

export const organizationsApi = {
  // Get all organizations for current user
  getOrganizations: async (): Promise<Organization[]> => {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        organization_members!inner(role)
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching organizations:', error);
      throw new Error(error.message);
    }

    // Get member counts separately
    const orgsWithCounts = await Promise.all(
      data.map(async (org) => {
        const { count } = await supabase
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', org.id);

        return {
          ...org,
          user_role: org.organization_members?.[0]?.role as 'owner' | 'admin' | 'member',
          member_count: count || 0
        };
      })
    );

    return orgsWithCounts;
  },

  // Get single organization by ID
  getOrganization: async (organizationId: string): Promise<Organization | null> => {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        organization_members!inner(role)
      `)
      .eq('id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching organization:', error);
      throw new Error(error.message);
    }

    const { count } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    return {
      ...data,
      user_role: data.organization_members?.[0]?.role as 'owner' | 'admin' | 'member',
      member_count: count || 0
    };
  },

  // Create new organization
  createOrganization: async (orgData: CreateOrganizationData): Promise<Organization> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: orgData.name,
        description: orgData.description || ''
      })
      .select()
      .single();

    if (orgError) {
      console.error('Error creating organization:', orgError);
      throw new Error(orgError.message);
    }

    // Add the creator as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
        invited_by: user.id
      });

    if (memberError) {
      console.error('Error adding organization owner:', memberError);
      throw new Error(memberError.message);
    }

    return {
      ...org,
      user_role: 'owner',
      member_count: 1
    };
  },

  // Update organization
  updateOrganization: async (organizationId: string, updates: Partial<CreateOrganizationData>): Promise<Organization> => {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating organization:', error);
      throw new Error(error.message);
    }

    return data;
  },

  // Get organization members
  getOrganizationMembers: async (organizationId: string): Promise<OrganizationMember[]> => {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        profiles(name, email)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching organization members:', error);
      throw new Error(error.message);
    }

    return data.map(member => ({
      ...member,
      role: member.role as 'owner' | 'admin' | 'member',
      profiles: member.profiles ? {
        name: member.profiles.name || '',
        email: member.profiles.email || ''
      } : undefined
    }));
  },

  // Invite member to organization
  inviteMember: async (organizationId: string, memberData: InviteOrganizationMemberData): Promise<void> => {
    // First, check if user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', memberData.email)
      .single();

    if (profileError || !profile) {
      throw new Error('User with this email does not exist');
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', profile.id)
      .single();

    if (existingMember) {
      throw new Error('User is already a member of this organization');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        user_id: profile.id,
        role: memberData.role,
        invited_by: user.id
      });

    if (error) {
      console.error('Error inviting member:', error);
      throw new Error(error.message);
    }
  },

  // Update member role
  updateMemberRole: async (memberId: string, role: 'admin' | 'member'): Promise<void> => {
    const { error } = await supabase
      .from('organization_members')
      .update({ role })
      .eq('id', memberId);

    if (error) {
      console.error('Error updating member role:', error);
      throw new Error(error.message);
    }
  },

  // Remove member from organization
  removeMember: async (memberId: string): Promise<void> => {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error removing member:', error);
      throw new Error(error.message);
    }
  },

  // Get user permissions
  getUserPermissions: async (organizationId: string, userId?: string): Promise<UserPermission[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const targetUserId = userId || user.id;

    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', targetUserId);

    if (error) {
      console.error('Error fetching user permissions:', error);
      throw new Error(error.message);
    }

    return data;
  }
};
