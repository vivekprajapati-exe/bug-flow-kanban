
import { supabase } from '@/integrations/supabase/client';

export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  organization_id?: string;
  status: 'active' | 'archived' | 'planning';
  created_at: string;
  updated_at: string;
  member_count?: number;
  user_role?: 'owner' | 'admin' | 'developer' | 'viewer';
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  invited_by: string | null;
  joined_at: string;
  created_at: string;
  profiles?: {
    name: string;
    email: string;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: 'active' | 'planning';
  organization_id?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: 'active' | 'archived' | 'planning';
  organization_id?: string;
}

export interface InviteMemberData {
  email: string;
  role: 'admin' | 'developer' | 'viewer';
}

export const projectsApi = {
  // Get all projects for current user
  getProjects: async (organizationId?: string): Promise<Project[]> => {
    let query = supabase
      .from('projects')
      .select(`
        *,
        project_members!inner(role),
        project_members(count)
      `)
      .order('updated_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error(error.message);
    }

    return data.map(project => ({
      ...project,
      member_count: project.project_members?.length || 0,
      user_role: project.project_members?.[0]?.role
    }));
  },

  // Get single project by ID
  getProject: async (projectId: string): Promise<Project | null> => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_members!inner(role),
        project_members(count)
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching project:', error);
      throw new Error(error.message);
    }

    return {
      ...data,
      member_count: data.project_members?.length || 0,
      user_role: data.project_members?.[0]?.role
    };
  },

  // Create new project
  createProject: async (projectData: CreateProjectData): Promise<Project> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        owner_id: user.id,
        description: projectData.description || ''
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw new Error(error.message);
    }

    return {
      ...data,
      member_count: 1,
      user_role: 'owner'
    };
  },

  // Update project
  updateProject: async (projectId: string, updates: UpdateProjectData): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw new Error(error.message);
    }

    return data;
  },

  // Delete project
  deleteProject: async (projectId: string): Promise<void> => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      throw new Error(error.message);
    }
  },

  // Get project members
  getProjectMembers: async (projectId: string): Promise<ProjectMember[]> => {
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        *,
        profiles!project_members_user_id_fkey(name, email)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching project members:', error);
      throw new Error(error.message);
    }

    return data;
  },

  // Invite member to project
  inviteMember: async (projectId: string, memberData: InviteMemberData): Promise<void> => {
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
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', profile.id)
      .single();

    if (existingMember) {
      throw new Error('User is already a member of this project');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
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
  updateMemberRole: async (memberId: string, role: 'admin' | 'developer' | 'viewer'): Promise<void> => {
    const { error } = await supabase
      .from('project_members')
      .update({ role })
      .eq('id', memberId);

    if (error) {
      console.error('Error updating member role:', error);
      throw new Error(error.message);
    }
  },

  // Remove member from project
  removeMember: async (memberId: string): Promise<void> => {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error removing member:', error);
      throw new Error(error.message);
    }
  },

  // Leave project (for current user)
  leaveProject: async (projectId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error leaving project:', error);
      throw new Error(error.message);
    }
  }
};
