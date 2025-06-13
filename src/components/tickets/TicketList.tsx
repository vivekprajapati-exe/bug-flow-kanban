// src/components/tickets/TicketList.tsx
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Ticket {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in progress' | 'done';
  assignee?: string;
  created_at: string;
}

interface TicketListProps {
  projectId: string;
}

export function TicketList({ projectId }: TicketListProps) {
  const supabase = useSupabaseClient();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load tickets.');
      // TODO: Show a toast notification for the error
    } else {
      setTickets(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [projectId]); // Refetch tickets when projectId changes

  if (isLoading) {
    return <div>Loading tickets...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <p>No tickets found for this project.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.title}</TableCell>
                  <TableCell>{ticket.status}</TableCell>
                  <TableCell>{ticket.priority}</TableCell>
                  <TableCell>{ticket.assignee || 'Unassigned'}</TableCell>
                  <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}