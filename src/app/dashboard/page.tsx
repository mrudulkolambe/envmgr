'use client';

import React from 'react';
import { useState, useMemo } from 'react';
import { ProjectSidebar } from '@/components/dashboard/project-sidebar';
import { EnvironmentPanel } from '@/components/dashboard/environment-panel';
import { VariableEditor } from '@/components/dashboard/variable-editor';
import { ProjectSettingsDialog } from '@/components/dashboard/project-settings-dialog';
import { DeleteProjectDialog } from '@/components/dashboard/delete-project-dialog';
import type { Environment, EnvironmentStatus, EnvironmentType, Project } from '@/types';


const initialProjects: Project[] = [
  {
    id: 1,
    name: 'Shop Frontend',
    description: 'Next.js storefront UI',
    environments: [
      {
        id: 101,
        name: 'Production',
        type: 'prod',
        status: 'active',
        variables: {
          NEXT_PUBLIC_API_URL: 'https://api.shop.com',
          NODE_ENV: 'production',
          SENTRY_DSN: '',
        },
      },
      {
        id: 102,
        name: 'Staging',
        type: 'stage',
        status: 'active',
        variables: {
          NEXT_PUBLIC_API_URL: 'https://staging-api.shop.com',
          NODE_ENV: 'production',
        },
      },
      {
        id: 103,
        name: 'Dev',
        type: 'dev',
        status: 'inactive',
        variables: {
          NEXT_PUBLIC_API_URL: 'http://localhost:4000',
          NODE_ENV: 'development',
        },
      },
    ],
  },
  {
    id: 2,
    name: 'Payments Service',
    description: 'Node + PostgreSQL',
    environments: [
      {
        id: 201,
        name: 'Prod',
        type: 'prod',
        status: 'active',
        variables: {
          DATABASE_URL: 'postgres://user:***@prod-db:5432/payments',
          LOG_LEVEL: 'info',
        },
      },
      {
        id: 202,
        name: 'Test',
        type: 'test',
        status: 'maintenance',
        variables: {
          DATABASE_URL: 'postgres://user:***@test-db:5432/payments_test',
          LOG_LEVEL: 'debug',
        },
      },
    ],
  },
];

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(projects[0]?.id ?? 0);
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const [selectedEnvId, setSelectedEnvId] = useState<number | null>(
    selectedProject?.environments?.[0]?.id ?? null
  );
  const selectedEnv = useMemo(
    () => selectedProject?.environments.find((e) => e.id === selectedEnvId) ?? null,
    [selectedProject, selectedEnvId]
  );



  function handleProjectSelect(projectId: number) {
    setSelectedProjectId(projectId);
    const project = projects.find((p) => p.id === projectId);
    setSelectedEnvId(project?.environments?.[0]?.id ?? null);
  }

  function handleAddProject(projectData: { name: string; description: string }) {
    const id = Math.floor(Math.random() * 10_000_000);
    const newProject: Project = {
      id,
      name: projectData.name,
      description: projectData.description,
      environments: [],
    };
    setProjects((prev) => [...prev, newProject]);
    setSelectedProjectId(id);
    setSelectedEnvId(null);
  }

  function handleUpdateProject(updates: Partial<Project>) {
    if (!selectedProject) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === selectedProject.id ? { ...p, ...updates } : p))
    );
  }

  function handleDeleteProject() {
    if (!selectedProject) return;
    setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
    const remainingProjects = projects.filter((p) => p.id !== selectedProject.id);
    if (remainingProjects.length > 0) {
      setSelectedProjectId(remainingProjects[0].id);
      setSelectedEnvId(remainingProjects[0].environments?.[0]?.id ?? null);
    } else {
      setSelectedProjectId(0);
      setSelectedEnvId(null);
    }
  }

  function updateSelectedEnv(updater: (env: Environment) => Environment) {
    if (!selectedProject || !selectedEnv) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== selectedProject.id) return p;
        return {
          ...p,
          environments: p.environments.map((e) => (e.id === selectedEnv.id ? updater(e) : e)),
        };
      })
    );
  }

  function handleVariableChange(key: string, value: string) {
    updateSelectedEnv((env) => ({
      ...env,
      variables: { ...(env.variables || {}), [key]: value },
    }));
  }

  function handleVariableDelete(key: string) {
    updateSelectedEnv((env) => {
      const next = { ...(env.variables || {}) };
      delete next[key];
      return { ...env, variables: next };
    });
  }

  function handleAddEnvironment(envData: { name: string; type: EnvironmentType; status: EnvironmentStatus }) {
    if (!selectedProject) return;
    const id = Math.floor(Math.random() * 10_000_000);
    const env: Environment = {
      id,
      name: envData.name,
      type: envData.type,
      status: envData.status,
      variables: {},
    };

    setProjects((prev) =>
      prev.map((p) => (p.id === selectedProject.id ? { ...p, environments: [...p.environments, env] } : p))
    );
    setSelectedEnvId(id);
  }

  function handleUpdateEnvironment(updates: Partial<Environment>) {
    if (!selectedProject || !selectedEnv) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== selectedProject.id) return p;
        return {
          ...p,
          environments: p.environments.map((e) => (e.id === selectedEnv.id ? { ...e, ...updates } : e)),
        };
      })
    );
  }

  function handleDeleteEnvironment() {
    if (!selectedProject || !selectedEnv) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== selectedProject.id) return p;
        return {
          ...p,
          environments: p.environments.filter((e) => e.id !== selectedEnv.id),
        };
      })
    );
    // Select the first remaining environment or null
    const remainingEnvs = selectedProject.environments.filter((e) => e.id !== selectedEnv.id);
    setSelectedEnvId(remainingEnvs.length > 0 ? remainingEnvs[0].id : null);
  }


  function handleImportEnv(text: string) {
    const result: Record<string, string> = {};
    text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line) => {
        if (line.startsWith('#')) return;
        const idx = line.indexOf('=');
        if (idx === -1) return;
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        result[key] = value;
      });
    
    updateSelectedEnv((env) => ({
      ...env,
      variables: { ...(env.variables || {}), ...result },
    }));
  }

  return (
    <div className="min-h-screen grid grid-cols-[280px_1fr]">
      <ProjectSidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectSelect={handleProjectSelect}
        onNewProject={handleAddProject}
      />

      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{selectedProject?.name}</h1>
            <div className="text-sm text-muted-foreground">{selectedProject?.description}</div>
          </div>
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
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
          <EnvironmentPanel
            selectedProject={selectedProject}
            selectedEnvId={selectedEnvId}
            onEnvSelect={setSelectedEnvId}
            onAddEnvironment={handleAddEnvironment}
            onUpdateEnvironment={handleUpdateEnvironment}
            onDeleteEnvironment={handleDeleteEnvironment}
          />
          <VariableEditor
            selectedEnv={selectedEnv}
            onVariableChange={handleVariableChange}
            onVariableDelete={handleVariableDelete}
            onImport={handleImportEnv}
            onUpdateEnvironment={handleUpdateEnvironment}
            onDeleteEnvironment={handleDeleteEnvironment}
          />
        </div>
      </main>
    </div>
  );
}