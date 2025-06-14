
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Users, Settings, Trash2 } from 'lucide-react';
import { Organization } from '@/lib/organizations';

interface OrganizationCardProps {
  organization: Organization;
  onClick: (organization: Organization) => void;
  onEdit?: (organization: Organization) => void;
  onManageMembers?: (organization: Organization) => void;
  onDelete?: (organization: Organization) => void;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  onClick,
  onEdit,
  onManageMembers,
  onDelete,
}) => {
  const handleCardClick = () => {
    onClick(organization);
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

  const canManage = organization.user_role === 'owner' || organization.user_role === 'admin';

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={handleCardClick}>
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
              {organization.name}
            </CardTitle>
            {organization.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {organization.description}
              </p>
            )}
          </div>
          
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(organization)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Organization
                  </DropdownMenuItem>
                )}
                {onManageMembers && (
                  <DropdownMenuItem onClick={() => onManageMembers(organization)}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Members
                  </DropdownMenuItem>
                )}
                {organization.user_role === 'owner' && onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(organization)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Organization
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent onClick={handleCardClick}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={getRoleBadgeVariant(organization.user_role || 'member')}>
              {organization.user_role}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-3 h-3 mr-1" />
              {organization.member_count} {organization.member_count === 1 ? 'member' : 'members'}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Created {new Date(organization.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
