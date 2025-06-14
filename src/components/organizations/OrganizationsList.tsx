
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { OrganizationCard } from './OrganizationCard';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';
import { useToast } from '@/hooks/use-toast';
import { organizationsApi, Organization } from '@/lib/organizations';

export const OrganizationsList: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await organizationsApi.getOrganizations();
      setOrganizations(data);
      setFilteredOrganizations(data);
    } catch (error) {
      toast({
        title: 'Error loading organizations',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    let filtered = organizations;

    if (searchTerm) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (org.description && org.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredOrganizations(filtered);
  }, [organizations, searchTerm]);

  const handleOrganizationClick = (organization: Organization) => {
    console.log('Navigate to organization:', organization.id);
    // TODO: Implement navigation to organization detail page
  };

  const handleDeleteOrganization = async (organization: Organization) => {
    if (!confirm(`Are you sure you want to delete "${organization.name}"? This action cannot be undone and will delete all projects and tickets in this organization.`)) {
      return;
    }

    try {
      // TODO: Implement organization deletion
      toast({
        title: 'Organization deleted',
        description: `${organization.name} has been deleted.`,
      });
      loadOrganizations();
    } catch (error) {
      toast({
        title: 'Error deleting organization',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">
            Manage your organizations and collaborate with your teams
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Organization
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Organizations Grid */}
      {filteredOrganizations.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {organizations.length === 0 ? 'No organizations yet' : 'No organizations found'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {organizations.length === 0 
              ? 'Create your first organization to get started with team collaboration.'
              : 'Try adjusting your search criteria.'
            }
          </p>
          {organizations.length === 0 && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Organization
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((organization) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
              onClick={handleOrganizationClick}
              onDelete={handleDeleteOrganization}
              onEdit={(org) => {
                console.log('Edit organization:', org.id);
                // TODO: Implement edit dialog
              }}
              onManageMembers={(org) => {
                console.log('Manage members for:', org.id);
                // TODO: Implement member management dialog
              }}
            />
          ))}
        </div>
      )}

      {/* Create Organization Dialog */}
      <CreateOrganizationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadOrganizations}
      />
    </div>
  );
};
