import React from 'react';
import { Header } from '@/components/layout/Header';
import { ProjectsList } from '@/components/projects/ProjectsList';

const Projects: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <ProjectsList />
      </div>
    </div>
  );
};

export default Projects;