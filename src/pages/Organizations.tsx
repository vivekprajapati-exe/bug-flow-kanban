
import React from 'react';
import { Header } from '@/components/layout/Header';
import { OrganizationsList } from '@/components/organizations/OrganizationsList';

const Organizations: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <OrganizationsList />
      </div>
    </div>
  );
};

export default Organizations;
