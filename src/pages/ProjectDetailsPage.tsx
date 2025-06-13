// src/pages/ProjectDetailsPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Assuming you're using react-router-dom
import { TicketForm } from '@/components/tickets/TicketForm';
import { TicketList } from '@/components/tickets/TicketList';
// Import the supabase instance directly
import { supabase } from '@/integrations/supabase/client';

// Assuming your profiles table has at least an id and email column
interface ProjectMember {
    id: string;
    email: string;
    name?: string; // Assuming a name field might exist
}

export function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  // Use the imported supabase instance directly
  // const supabase = useSupabaseClient();
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (!projectId) return;

      setIsLoadingMembers(true);
      // Fetch project members by joining project_members and profiles tables
      const { data, error } = await supabase
        .from('project_members')
        .select('profiles(id, email, name)') // Select user id, email, and name from the joined profiles table
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching project members:', error);
        setMembersError('Failed to load project members.');
        // TODO: Show a toast notification for the error
      } else {
        // The data structure will be { profiles: { id, email, name } }[]
        // We need to transform it to { id, email, name }[]
        const members = data.map((item: any) => item.profiles).filter((profile: any) => profile !== null);
        setProjectMembers(members);
      }
      setIsLoadingMembers(false);
    };

    fetchProjectMembers();
  // Remove supabase from the dependency array as it's not a prop/state
  }, [projectId]); // Refetch when projectId changes
  if (!projectId) {
    return <div>Project not found.</div>; // Handle case where projectId is missing
  }

  // Function to refresh the ticket list after a new ticket is created
  const handleTicketCreated = () => {
    // This is a simple way to trigger a refresh.
    // In a real application, you might want to use a state management solution
    // or a more sophisticated data fetching strategy.
    // For now, we'll just reload the members list to keep it simple
     fetchProjectMembers(); // Re-fetch members as well, in case new members were added
     window.location.reload(); // Still doing a full reload for ticket list
  };

  if (isLoadingMembers) {
      return <div>Loading project members...</div>;
  }

  if (membersError) {
      return <div className="text-red-500">{membersError}</div>;
  }


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Project: {projectId}</h1> {/* Display project ID or fetch project details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Create New Ticket</h2>
          {/* Pass projectMembers to TicketForm */}
          <TicketForm
            projectId={projectId}
            onTicketCreated={handleTicketCreated}
            projectMembers={projectMembers}
          />
        </div>
        <div>
          <TicketList projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
