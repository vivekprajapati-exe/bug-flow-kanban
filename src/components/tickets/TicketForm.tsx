// src/components/tickets/TicketForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupabaseClient } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  assignee: z.string().optional(), // Assuming assignee is a user ID
  status: z.enum(['todo', 'in progress', 'done']).default('todo'),
});

type TicketFormValues = z.infer<typeof formSchema>;

// Add projectMembers back to the interface
interface TicketFormProps {
  projectId: string;
  onTicketCreated: () => void;
  projectMembers: { id: string; email: string; name?: string }[]; // Assuming members have id, email, and potentially name
}

// Add projectMembers to the function signature
export function TicketForm({ projectId, onTicketCreated, projectMembers }: TicketFormProps) {
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'low',
      status: 'todo',
      assignee: '',
    },
  });

  async function onSubmit(values: TicketFormValues) {
    setIsSubmitting(true);
    const { data, error } = await supabase
      .from('tickets')
      .insert([
        {
          title: values.title,
          description: values.description,
          priority: values.priority,
          assignee: values.assignee || null,
          status: values.status,
          project_id: projectId,
        },
      ])
      .select(); // Select to get the inserted data back

    if (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Error creating ticket',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      console.log('Ticket created:', data);
      form.reset();
      onTicketCreated();
      toast({
        title: 'Ticket created successfully',
        description: 'Your ticket has been added to the project.',
      });
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Ticket title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Ticket description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Populate Assignee Select with project members */}
        <FormField
          control={form.control}
          name="assignee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignee (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an assignee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projectMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name || member.email} {/* Display name if available, otherwise email */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Ticket'}
        </Button>
      </form>
    </Form>
  );
}
