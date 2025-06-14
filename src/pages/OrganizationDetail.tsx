
import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { OrganizationDetailView } from '@/components/organizations/OrganizationDetailView';

const OrganizationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Organization not found</h1>
            <p className="text-muted-foreground mt-2">The organization ID is missing.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <OrganizationDetailView organizationId={id} />
      </div>
    </div>
  );
};

export default OrganizationDetail;
