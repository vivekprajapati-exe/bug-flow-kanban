
import React from 'react';
import { Header } from '@/components/layout/Header';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome to BugTracker Pro
          </h1>
          <p className="text-xl text-muted-foreground">
            Your professional bug tracking and project management platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 border rounded-lg bg-card hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Track Issues</h3>
              <p className="text-muted-foreground">Efficiently manage and track bugs and issues</p>
            </div>
            <div className="p-6 border rounded-lg bg-card hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
              <p className="text-muted-foreground">Work together with your development team</p>
            </div>
            <div className="p-6 border rounded-lg bg-card hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Project Management</h3>
              <p className="text-muted-foreground">Organize and manage your projects effectively</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
