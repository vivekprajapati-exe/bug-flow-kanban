
-- Add foreign key constraint to link organization_members.user_id to profiles.id
ALTER TABLE public.organization_members 
ADD CONSTRAINT fk_organization_members_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id 
ON public.organization_members(user_id);
