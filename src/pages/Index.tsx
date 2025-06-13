
import { useState } from 'react';
import { Plus, Bug, Users, FolderOpen, Search, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Index = () => {
  const [selectedProject, setSelectedProject] = useState('All Projects');

  // Mock data for demonstration
  const projects = [
    { id: 1, name: 'Bug Tracker Pro', issues: 23, members: 5, status: 'active' },
    { id: 2, name: 'E-commerce Platform', issues: 15, members: 8, status: 'active' },
    { id: 3, name: 'Mobile App', issues: 7, members: 3, status: 'planning' },
  ];

  const recentIssues = [
    { id: 1, title: 'Login form validation error', project: 'Bug Tracker Pro', priority: 'High', status: 'In Progress', assignee: 'JD' },
    { id: 2, title: 'UI spacing issues on mobile', project: 'E-commerce Platform', priority: 'Medium', status: 'To Do', assignee: 'AS' },
    { id: 3, title: 'Database connection timeout', project: 'Bug Tracker Pro', priority: 'Critical', status: 'To Do', assignee: 'MK' },
    { id: 4, title: 'Feature: Dark mode toggle', project: 'Mobile App', priority: 'Low', status: 'Done', assignee: 'JD' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Done': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Bug className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  BugTracker Pro
                </h1>
              </div>
              
              <div className="hidden md:flex items-center space-x-1 ml-8">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Projects
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Bug className="w-4 h-4 mr-2" />
                  Issues
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Users className="w-4 h-4 mr-2" />
                  Team
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search issues..." 
                  className="pl-10 w-64 bg-white/50 border-white/20 focus:bg-white/80"
                />
              </div>
              
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Welcome back, John!</h2>
              <p className="text-blue-100 mb-6">You have 5 active issues across 3 projects. Let's tackle them together.</p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-white/20 hover:bg-white/30 border-white/30 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Issue
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full"></div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Issues</CardTitle>
              <Bug className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">45</div>
              <p className="text-xs text-green-600">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <p className="text-xs text-blue-600">2 in planning</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Team Members</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">16</div>
              <p className="text-xs text-gray-600">Across all projects</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Resolved Today</CardTitle>
              <div className="h-4 w-4 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">8</div>
              <p className="text-xs text-green-600">Great progress!</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects and Recent Issues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Projects</CardTitle>
                  <CardDescription>Manage your active projects</CardDescription>
                </div>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 rounded-lg bg-white/50 border border-white/20 hover:bg-white/70 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <Badge variant="outline" className={project.status === 'active' ? 'border-green-200 text-green-700' : 'border-yellow-200 text-yellow-700'}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{project.issues} issues</span>
                      <span>{project.members} members</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Issues */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Recent Issues</CardTitle>
                  <CardDescription>Latest activity across projects</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="border-white/30">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIssues.map((issue) => (
                  <div key={issue.id} className="p-4 rounded-lg bg-white/50 border border-white/20 hover:bg-white/70 transition-all duration-200">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">{issue.title}</h3>
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">{issue.assignee}</AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{issue.project}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
