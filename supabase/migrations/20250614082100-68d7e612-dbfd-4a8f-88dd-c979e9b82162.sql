
-- Add Row Level Security policies for tickets table
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Users can view tickets for projects they are members of
CREATE POLICY "Users can view tickets for their projects"
  ON public.tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = tickets.project_id 
      AND pm.user_id = auth.uid()
    )
  );

-- Users can create tickets for projects they are members of
CREATE POLICY "Users can create tickets for their projects"
  ON public.tickets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = tickets.project_id 
      AND pm.user_id = auth.uid()
    )
  );

-- Users can update tickets for projects they are members of
CREATE POLICY "Users can update tickets for their projects"
  ON public.tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = tickets.project_id 
      AND pm.user_id = auth.uid()
    )
  );

-- Users can delete tickets for projects they are members of (or project owners/admins)
CREATE POLICY "Users can delete tickets for their projects"
  ON public.tickets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = tickets.project_id 
      AND pm.user_id = auth.uid()
    )
  );

-- Add indexes for better performance on tickets
CREATE INDEX IF NOT EXISTS idx_tickets_project_id ON public.tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON public.tickets(assignee);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);

-- Add function to update tickets updated_at timestamp
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
