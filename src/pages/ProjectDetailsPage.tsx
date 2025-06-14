
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { TicketForm } from '@/components/tickets/TicketForm';
import { TicketList } from '@/components/tickets/TicketList';
import { supabase } from '@/integrations/supabase/client';

interface ProjectMember {
  id: string;
  email: string;
  name?: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'planning';
  created_at: string;
  owner_id: string;
}

export function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketUpdateTrigger, setTicketUpdateTrigger] = useState(0);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (projectError) {
          console.error('Error fetching project:', projectError);
          setError('Failed to load project details.');
          toast({
            title: 'Error loading project',
            description: projectError.message,
            variant: 'destructive',
          });
          return;
        }

        setProject(projectData);

        // Fetch project members
        const { data: membersData, error: membersError } = await supabase
          .from('project_members')
          .select('profiles(id, email, name)')
          .eq('project_id', projectId);

        if (membersError) {
          console.error('Error fetching project members:', membersError);
          setError('Failed to load project members.');
          toast({
            title: 'Error loading members',
            description: membersError.message,
            variant: 'destructive',
          });
        } else {
          const members = membersData
            .map((item: any) => item.profiles)
            .filter((profile: any) => profile !== null);
          setProjectMembers(members);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, toast]);

  const handleTicketCreated = () => {
    setTicketUpdateTrigger(prev => prev + 1);
    toast({
      title: 'Success',
      description: 'Ticket created successfully!',
    });
  };

  if (!projectId) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Project not found</h1>
          <Button onClick={() => navigate('/projects')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <div className="text-muted-foreground">Loading project details...</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            {error || 'Project not found'}
          </h1>
          <Button onClick={() => navigate('/projects')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Navigation Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/projects')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-2">{project.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created {new Date(project.created_at).toLocaleDateString()}
              </span>
              <span className="text-sm text-muted-foreground">
                {projectMembers.length} member{projectMembers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Ticket Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create New Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketForm
                projectId={projectId}
                onTicketCreated={handleTicketCreated}
                projectMembers={projectMembers}
              />
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <div className="lg:col-span-2">
          <TicketList 
            projectId={projectId} 
            key={ticketUpdateTrigger}
          />
        </div>
      </div>
    </div>
  );
}
