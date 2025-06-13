import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreHorizontal, 
  Users, 
  Calendar, 
  Settings,
  Archive,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Project } from '@/lib/projects';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onArchive?: (project: Project) => void;
  onManageMembers?: (project: Project) => void;
  onClick?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onArchive,
  onManageMembers,
  onClick
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'planning':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'developer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canManage = project.user_role === 'owner' || project.user_role === 'admin';

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={() => onClick?.(project)}>
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {project.name}
              </CardTitle>
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(project.status)}`}
              >
                {project.status}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2 text-sm">
              {project.description || 'No description provided'}
            </CardDescription>
          </div>
          
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit?.(project)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManageMembers?.(project)}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Members
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {project.status !== 'archived' && (
                  <DropdownMenuItem onClick={() => onArchive?.(project)}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive Project
                  </DropdownMenuItem>
                )}
                {project.user_role === 'owner' && (
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(project)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0" onClick={() => onClick?.(project)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{project.member_count || 0} members</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {project.user_role && (
              <Badge 
                variant="outline" 
                className={`text-xs ${getRoleColor(project.user_role)}`}
              >
                {project.user_role}
              </Badge>
            )}
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {project.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};