'use client';

import React from 'react';
import { Folder, Search, Plus, ChevronRight, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';
import { AddProjectDialog } from './add-project-dialog';
import { ThemeToggle } from '@/components/ui/theme-toggle';

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
  const { user } = useUser();
  return (
    <aside className="flex flex-col h-screen border-r bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b bg-card/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10 shadow-sm">
            <Folder className="size-5 text-primary" />
          </div>
          <div className="font-semibold text-lg tracking-tight">Env Manager</div>
        </div>
        <ThemeToggle />
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input 
            className="pl-9 rounded-md shadow-sm border-0 bg-muted/50" 
            placeholder="Search projects..." 
          />
        </div>
      </div>

      {/* Projects */}
      <div className="flex-1 overflow-auto">
        {projects.length === 0 ? (
          <div className="h-full flex items-center justify-center p-4 text-center">
            <div className="space-y-2">
              <div className="font-medium text-sm text-muted-foreground">No projects yet</div>
              <div className="text-xs text-muted-foreground/80">
                Create your first project to get started.
              </div>
            </div>
          </div>
        ) : (
          <nav className="p-2 space-y-1">
            {projects.map((p) => {
              const active = p.id === selectedProjectId;
              return (
                <button
                  key={p.id}
                  onClick={() => onProjectSelect(p.id)}
                  className={cn(
                    'w-full text-left rounded-md px-3 py-2.5 transition-all duration-200 group shadow-sm',
                    active 
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-md' 
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium truncate">{p.name}</span>
                    <ChevronRight className={cn(
                      'size-4 transition-opacity',
                      active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                    )} />
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">{p.description}</div>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Add Project */}
      {projects.length > 0 && (
        <div className="p-3 border-t">
          <AddProjectDialog onAddProject={onNewProject} />
        </div>
      )}

      {/* User Section */}
      <div className="p-3 border-t bg-card/20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 p-2 h-auto rounded-md hover:bg-sidebar-accent/50 transition-colors">
              <Avatar className="size-8 shadow-sm">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{user?.fullName || "User"}</div>
                <div className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="gap-2">
              <User className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <SignOutButton>
              <DropdownMenuItem className="gap-2 text-destructive">
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </SignOutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
