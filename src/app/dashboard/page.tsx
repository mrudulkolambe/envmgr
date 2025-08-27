'use client';

import React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { ProjectSidebar } from '@/components/dashboard/project-sidebar';
import { EnvironmentPanel } from '@/components/dashboard/environment-panel';
import { VariableEditor } from '@/components/dashboard/variable-editor';
import { ProjectSettingsDialog } from '@/components/dashboard/project-settings-dialog';
import { DeleteProjectDialog } from '@/components/dashboard/delete-project-dialog';
import type { Environment, EnvironmentStatus, EnvironmentType, Project } from '@/types';
import { AddProjectDialog } from '@/components/dashboard/add-project-dialog';
import { Button } from '@/components/ui/button';
import { projectsApi, environmentsApi, variablesApi, type ApiProject, type ApiEnvironment } from '@/lib/api';

// Convert API types to frontend types
function convertApiProject(apiProject: ApiProject): Project {
  return {
    id: parseInt(apiProject._id.slice(-8), 16), // Convert MongoDB ObjectId to number for compatibility
    name: apiProject.name,
    description: apiProject.description,
    environments: [], // Will be loaded separately
  };
}

function convertApiEnvironment(apiEnv: ApiEnvironment): Environment {
  return {
    id: parseInt(apiEnv._id.slice(-8), 16), // Convert MongoDB ObjectId to number for compatibility
    name: apiEnv.name,
    type: apiEnv.type,
    status: apiEnv.status,
    variables: apiEnv.variables,
  };
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [apiProjects, setApiProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [projectEnvironments, setProjectEnvironments] = useState<Record<string, Environment[]>>({});
  const [apiEnvironments, setApiEnvironments] = useState<Record<string, ApiEnvironment[]>>({});
  
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const selectedApiProject = useMemo(() => {
    if (!selectedProject) return null;
    return apiProjects.find(p => parseInt(p._id.slice(-8), 16) === selectedProjectId) ?? null;
  }, [selectedProject, apiProjects]);

  const selectedProjectEnvs = useMemo(() => {
    if (!selectedProject) return [];
    return projectEnvironments[selectedProject.id.toString()] || [];
  }, [selectedProject, projectEnvironments]);

  const [selectedEnvId, setSelectedEnvId] = useState<number | null>(null);
  const selectedEnv = useMemo(
    () => selectedProjectEnvs.find((e) => e.id === selectedEnvId) ?? null,
    [selectedProjectEnvs, selectedEnvId]
  );

  const selectedApiEnv = useMemo(() => {
    if (!selectedEnv || !selectedApiProject) return null;
    const envs = apiEnvironments[selectedApiProject._id] || [];
    return envs.find(e => parseInt(e._id.slice(-8), 16) === selectedEnvId) ?? null;
  }, [selectedEnv, selectedApiProject, apiEnvironments, selectedEnvId]);

  // Load projects on mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await projectsApi.getAll();
        setApiProjects(response.projects);
        const convertedProjects = response.projects.map(convertApiProject);
        setProjects(convertedProjects);
        
        if (convertedProjects.length > 0) {
          setSelectedProjectId(convertedProjects[0].id);
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  // Load environments when project changes
  useEffect(() => {
    async function loadEnvironments() {
      if (!selectedApiProject) return;
      
      try {
        const response = await environmentsApi.getByProjectId(selectedApiProject._id);
        setApiEnvironments(prev => ({
          ...prev,
          [selectedApiProject._id]: response.environments
        }));
        
        const convertedEnvs = response.environments.map(convertApiEnvironment);
        setProjectEnvironments(prev => ({
          ...prev,
          [selectedProjectId.toString()]: convertedEnvs
        }));

        if (convertedEnvs.length > 0 && !selectedEnvId) {
          setSelectedEnvId(convertedEnvs[0].id);
        }
      } catch (error) {
        console.error('Failed to load environments:', error);
      }
    }
    loadEnvironments();
  }, [selectedApiProject, selectedProjectId, selectedEnvId]);



  function handleProjectSelect(projectId: number) {
    setSelectedProjectId(projectId);
    setSelectedEnvId(null); // Reset environment selection
  }

  async function handleAddProject(projectData: { name: string; description: string }) {
    try {
      const response = await projectsApi.create(projectData);
      const newApiProject = response.project;
      const newProject = convertApiProject(newApiProject);
      
      setApiProjects(prev => [...prev, newApiProject]);
      setProjects(prev => [...prev, newProject]);
      setSelectedProjectId(newProject.id);
      setSelectedEnvId(null);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  }

  async function handleUpdateProject(updates: Partial<Project>) {
    if (!selectedProject || !selectedApiProject) return;
    
    try {
      const response = await projectsApi.update(selectedApiProject._id, {
        name: updates.name || selectedProject.name,
        description: updates.description || selectedProject.description,
      });
      
      const updatedApiProject = response.project;
      const updatedProject = convertApiProject(updatedApiProject);
      
      setApiProjects(prev => prev.map(p => p._id === selectedApiProject._id ? updatedApiProject : p));
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  }

  async function handleDeleteProject() {
    if (!selectedProject || !selectedApiProject) return;
    
    try {
      await projectsApi.delete(selectedApiProject._id);
      
      setApiProjects(prev => prev.filter(p => p._id !== selectedApiProject._id));
      setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
      
      const remainingProjects = projects.filter(p => p.id !== selectedProject.id);
      if (remainingProjects.length > 0) {
        setSelectedProjectId(remainingProjects[0].id);
        setSelectedEnvId(null);
      } else {
        setSelectedProjectId(0);
        setSelectedEnvId(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }

  async function handleVariableChange(key: string, value: string) {
    if (!selectedApiEnv) return;
    
    try {
      await variablesApi.update(selectedApiEnv._id, key, value);
      
      // Update local state
      setApiEnvironments(prev => ({
        ...prev,
        [selectedApiProject!._id]: prev[selectedApiProject!._id].map(env => 
          env._id === selectedApiEnv._id 
            ? { ...env, variables: { ...env.variables, [key]: value } }
            : env
        )
      }));
      
      setProjectEnvironments(prev => ({
        ...prev,
        [selectedProjectId.toString()]: prev[selectedProjectId.toString()].map(env =>
          env.id === selectedEnvId
            ? { ...env, variables: { ...env.variables, [key]: value } }
            : env
        )
      }));
    } catch (error) {
      console.error('Failed to update variable:', error);
    }
  }

  async function handleVariableDelete(key: string) {
    if (!selectedApiEnv) return;
    
    try {
      await variablesApi.delete(selectedApiEnv._id, key);
      
      // Update local state
      setApiEnvironments(prev => ({
        ...prev,
        [selectedApiProject!._id]: prev[selectedApiProject!._id].map(env => {
          if (env._id === selectedApiEnv._id) {
            const newVars = { ...env.variables };
            delete newVars[key];
            return { ...env, variables: newVars };
          }
          return env;
        })
      }));
      
      setProjectEnvironments(prev => ({
        ...prev,
        [selectedProjectId.toString()]: prev[selectedProjectId.toString()].map(env => {
          if (env.id === selectedEnvId) {
            const newVars = { ...env.variables };
            delete newVars[key];
            return { ...env, variables: newVars };
          }
          return env;
        })
      }));
    } catch (error) {
      console.error('Failed to delete variable:', error);
    }
  }

  async function handleAddEnvironment(envData: { name: string; type: EnvironmentType; status: EnvironmentStatus }) {
    if (!selectedApiProject) return;
    
    try {
      const response = await environmentsApi.create({
        ...envData,
        projectId: selectedApiProject._id,
      });
      
      const newApiEnv = response.environment;
      const newEnv = convertApiEnvironment(newApiEnv);
      
      setApiEnvironments(prev => ({
        ...prev,
        [selectedApiProject._id]: [...(prev[selectedApiProject._id] || []), newApiEnv]
      }));
      
      setProjectEnvironments(prev => ({
        ...prev,
        [selectedProjectId.toString()]: [...(prev[selectedProjectId.toString()] || []), newEnv]
      }));
      
      setSelectedEnvId(newEnv.id);
    } catch (error) {
      console.error('Failed to create environment:', error);
    }
  }

  async function handleUpdateEnvironment(updates: Partial<Environment>) {
    if (!selectedApiEnv) return;
    
    try {
      const response = await environmentsApi.update(selectedApiEnv._id, {
        name: updates.name,
        type: updates.type,
        status: updates.status,
      });
      
      const updatedApiEnv = response.environment;
      const updatedEnv = convertApiEnvironment(updatedApiEnv);
      
      setApiEnvironments(prev => ({
        ...prev,
        [selectedApiProject!._id]: prev[selectedApiProject!._id].map(env =>
          env._id === selectedApiEnv._id ? updatedApiEnv : env
        )
      }));
      
      setProjectEnvironments(prev => ({
        ...prev,
        [selectedProjectId.toString()]: prev[selectedProjectId.toString()].map(env =>
          env.id === selectedEnvId ? updatedEnv : env
        )
      }));
    } catch (error) {
      console.error('Failed to update environment:', error);
    }
  }

  async function handleDeleteEnvironment() {
    if (!selectedApiEnv) return;
    
    try {
      await environmentsApi.delete(selectedApiEnv._id);
      
      setApiEnvironments(prev => ({
        ...prev,
        [selectedApiProject!._id]: prev[selectedApiProject!._id].filter(env => env._id !== selectedApiEnv._id)
      }));
      
      setProjectEnvironments(prev => ({
        ...prev,
        [selectedProjectId.toString()]: prev[selectedProjectId.toString()].filter(env => env.id !== selectedEnvId)
      }));
      
      // Select the first remaining environment or null
      const remainingEnvs = selectedProjectEnvs.filter(e => e.id !== selectedEnvId);
      setSelectedEnvId(remainingEnvs.length > 0 ? remainingEnvs[0].id : null);
    } catch (error) {
      console.error('Failed to delete environment:', error);
    }
  }

  async function handleImportEnv(text: string) {
    if (!selectedApiEnv) return;
    
    try {
      const response = await variablesApi.bulkImport({
        environmentId: selectedApiEnv._id,
        envText: text,
      });
      
      // Update local state with imported variables
      setApiEnvironments(prev => ({
        ...prev,
        [selectedApiProject!._id]: prev[selectedApiProject!._id].map(env =>
          env._id === selectedApiEnv._id
            ? { ...env, variables: response.variables }
            : env
        )
      }));
      
      setProjectEnvironments(prev => ({
        ...prev,
        [selectedProjectId.toString()]: prev[selectedProjectId.toString()].map(env =>
          env.id === selectedEnvId
            ? { ...env, variables: response.variables }
            : env
        )
      }));
    } catch (error) {
      console.error('Failed to import variables:', error);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-[320px_1fr] h-screen">
        <ProjectSidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectSelect={handleProjectSelect}
          onNewProject={handleAddProject}
        />

        <main className="flex flex-col h-screen">
          {/* Header - Fixed Height */}
          <div className="h-32 border-b bg-card/50 backdrop-blur-sm shadow-sm flex-shrink-0">
            <div className="p-6 h-full">
              <div className="flex items-center justify-between gap-3 h-full">
                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {selectedProject?.name || 'Select a Project'}
                  </h1>
                  <div className="text-sm text-muted-foreground">
                    {selectedProject?.description || 'Choose a project from the sidebar to get started'}
                  </div>
                </div>
                {selectedProject && (
                  <div className="flex items-center gap-2">
                    <ProjectSettingsDialog
                      project={selectedProject}
                      onUpdateProject={handleUpdateProject}
                      onDeleteProject={handleDeleteProject}
                    />
                    <DeleteProjectDialog
                      project={selectedProject}
                      onDeleteProject={handleDeleteProject}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content - Calculated Height */}
          <div className="p-6 overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
            {projects.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-6 max-w-lg">
                  <div className="relative">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold tracking-tight">No projects yet</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Organize your environment variables across multiple projects and environments.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <AddProjectDialog
                      onAddProject={handleAddProject}
                      trigger={
                        <Button size="lg" className="rounded-lg shadow-md hover:shadow-lg transition-shadow">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create Your First Project
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            ) : selectedProject ? (
              <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 h-full">
                <div className="overflow-auto">
                  <EnvironmentPanel
                    selectedProject={selectedProject}
                    environments={selectedProjectEnvs}
                    selectedEnvId={selectedEnvId}
                    onEnvSelect={setSelectedEnvId}
                    onAddEnvironment={handleAddEnvironment}
                    onUpdateEnvironment={handleUpdateEnvironment}
                    onDeleteEnvironment={handleDeleteEnvironment}
                  />
                </div>
                <div className="overflow-auto">
                  <VariableEditor
                    selectedEnv={selectedEnv}
                    onVariableChange={handleVariableChange}
                    onVariableDelete={handleVariableDelete}
                    onImport={handleImportEnv}
                    onUpdateEnvironment={handleUpdateEnvironment}
                    onDeleteEnvironment={handleDeleteEnvironment}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 max-w-md">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-md flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      Welcome to Env Manager
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select a project from the sidebar or create a new one to start managing your environment variables.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}