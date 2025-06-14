
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Mail, UserMinus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organizationsApi, OrganizationMember } from '@/lib/organizations';

interface OrganizationMembersViewProps {
  organizationId: string;
  userRole?: 'owner' | 'admin' | 'member';
}

export const OrganizationMembersView: React.FC<OrganizationMembersViewProps> = ({
  organizationId,
  userRole
}) => {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [inviteLoading, setInviteLoading] = useState(false);
  const { toast } = useToast();

  const canManageMembers = userRole === 'owner' || userRole === 'admin';

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await organizationsApi.getOrganizationMembers(organizationId);
      setMembers(data);
    } catch (error) {
      toast({
        title: 'Error loading members',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [organizationId]);

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    try {
      await organizationsApi.inviteMember(organizationId, {
        email: inviteEmail,
        role: inviteRole
      });

      toast({
        title: 'Member invited!',
        description: `${inviteEmail} has been invited to the organization.`,
      });

      setInviteEmail('');
      setInviteRole('member');
      setInviteDialogOpen(false);
      loadMembers();
    } catch (error) {
      toast({
        title: 'Error inviting member',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      await organizationsApi.updateMemberRole(memberId, newRole);
      toast({
        title: 'Role updated',
        description: 'Member role has been updated successfully.',
      });
      loadMembers();
    } catch (error) {
      toast({
        title: 'Error updating role',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this organization?`)) {
      return;
    }

    try {
      await organizationsApi.removeMember(memberId);
      toast({
        title: 'Member removed',
        description: `${memberName} has been removed from the organization.`,
      });
      loadMembers();
    } catch (error) {
      toast({
        title: 'Error removing member',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'member':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Organization Members</h3>
        {canManageMembers && (
          <Button onClick={() => setInviteDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {member.profiles?.name?.charAt(0)?.toUpperCase() || 
                   member.profiles?.email?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div>
                <div className="font-medium">
                  {member.profiles?.name || 'Unknown User'}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {member.profiles?.email || 'No email'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={getRoleBadgeVariant(member.role)}>
                {member.role}
              </Badge>

              {canManageMembers && member.role !== 'owner' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleUpdateRole(member.id, member.role === 'admin' ? 'member' : 'admin')}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Make {member.role === 'admin' ? 'Member' : 'Admin'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleRemoveMember(member.id, member.profiles?.name || 'this user')}
                      className="text-destructive"
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Invite a new member to join this organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={(value: 'admin' | 'member') => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
              disabled={inviteLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleInviteMember} disabled={inviteLoading || !inviteEmail.trim()}>
              {inviteLoading ? 'Inviting...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
