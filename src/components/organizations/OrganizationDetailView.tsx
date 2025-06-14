
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Settings, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organizationsApi, Organization } from '@/lib/organizations';
import { projectsApi, Project } from '@/lib/projects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { OrganizationMembersView } from './OrganizationMembersView';

interface OrganizationDetailViewProps {
  organizationId: string;
}

export const OrganizationDetailView: React.FC<OrganizationDetailViewProps> = ({
  organizationId
}) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadOrganization = async () => {
    try {
      const org = await organizationsApi.getOrganization(organizationId);
      if (!org) {
        toast({
          title: 'Organization not found',
          description: 'The organization you are looking for does not exist.',
          variant: 'destructive',
        });
        navigate('/organizations');
        return;
      }
      setOrganization(org);
    } catch (error) {
      toast({
        title: 'Error loading organization',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const loadProjects = async () => {
    try {
      const orgProjects = await projectsApi.getProjects(organizationId);
      setProjects(orgProjects);
    } catch (error) {
      toast({
        title: 'Error loading projects',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadOrganization(), loadProjects()]);
      setLoading(false);
    };
    loadData();
  }, [organizationId]);

  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const canManageOrganization = organization?.user_role === 'owner' || organization?.user_role === 'admin';
  const canCreateProjects = canManageOrganization;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Organization not found</h3>
        <p className="text-muted-foreground mb-4">
          The organization you are looking for does not exist or you don't have access to it.
        </p>
        <Button onClick={() => navigate('/organizations')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Organizations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/organizations')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Organizations
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <Badge variant={organization.user_role === 'owner' ? 'default' : 'secondary'}>
              {organization.user_role}
            </Badge>
          </div>
          {organization.description && (
            <p className="text-muted-foreground">{organization.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {organization.member_count} {organization.member_count === 1 ? 'member' : 'members'}
            </div>
            <div>
              Created {new Date(organization.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {canManageOrganization && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Projects</h2>
            {canCreateProjects && (
              <Button onClick={() => setCreateProjectOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first project to get started.
              </p>
              {canCreateProjects && (
                <Button onClick={() => setCreateProjectOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Project
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={handleProjectClick}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members">
          <OrganizationMembersView 
            organizationId={organizationId}
            userRole={organization.user_role}
          />
        </TabsContent>
      </Tabs>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onSuccess={loadProjects}
      />
    </div>
  );
};
