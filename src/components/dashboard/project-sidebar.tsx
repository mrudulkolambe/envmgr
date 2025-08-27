'use client';

import React from 'react';
import { Folder, Search, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';
import { AddProjectDialog } from './add-project-dialog';

interface ProjectSidebarProps {
  projects: Project[];
  selectedProjectId: number;
  onProjectSelect: (projectId: number) => void;
  onNewProject: (projectData: { name: string; description: string }) => void;
}

export function ProjectSidebar({ 
  projects, 
  selectedProjectId, 
  onProjectSelect, 
  onNewProject 
}: ProjectSidebarProps) {
  return (
    <aside className="border-r bg-sidebar text-sidebar-foreground">
      <div className="h-14 flex items-center gap-2 px-4 border-b">
        <Folder className="size-5" />
        <div className="font-semibold truncate">Env Manager</div>
      </div>
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search projects..." />
        </div>
      </div>
      <Separator />
      <nav className="p-2 space-y-1">
        {projects.map((p) => {
          const active = p.id === selectedProjectId;
          return (
            <button
              key={p.id}
              onClick={() => onProjectSelect(p.id)}
              className={cn(
                'w-full text-left rounded-md px-3 py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition',
                active && 'bg-sidebar-accent text-sidebar-accent-foreground'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">{p.name}</span>
                <ChevronRight className={cn('size-4 transition', active && 'opacity-100', !active && 'opacity-0')} />
              </div>
              <div className="text-xs text-muted-foreground truncate">{p.description}</div>
            </button>
          );
        })}
      </nav>
      <div className="p-3">
        <AddProjectDialog onAddProject={onNewProject} />
      </div>
    </aside>
  );
}
