'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Environment, EnvironmentStatus, EnvironmentType, Project } from '@/types';

const ENV_TYPE_LABEL: Record<EnvironmentType, string> = {
  prod: 'Production',
  stage: 'Staging',
  dev: 'Development',
  test: 'Testing',
};

const ENV_TYPE_TONE: Record<EnvironmentType, string> = {
  prod: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  stage: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  dev: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  test: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

const STATUS_TONE: Record<EnvironmentStatus, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  inactive: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300',
  maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

interface EnvironmentPanelProps {
  selectedProject: Project | null;
  selectedEnvId: number | null;
  onEnvSelect: (envId: number) => void;
  onAddEnvironment: (env: { name: string; type: EnvironmentType; status: EnvironmentStatus }) => void;
  onUpdateEnvironment: (updates: Partial<Environment>) => void;
  onDeleteEnvironment: () => void;
}

export function EnvironmentPanel({ 
  selectedProject, 
  selectedEnvId, 
  onEnvSelect, 
  onAddEnvironment,
  onUpdateEnvironment,
  onDeleteEnvironment
}: EnvironmentPanelProps) {
  const [isNewEnvOpen, setIsNewEnvOpen] = useState(false);
  const [newEnv, setNewEnv] = useState<{ name: string; type: EnvironmentType; status: EnvironmentStatus }>({
    name: '',
    type: 'dev',
    status: 'active',
  });

  const handleAddNewEnv = () => {
    const trimmed = newEnv.name.trim();
    if (!trimmed) return;

    onAddEnvironment(newEnv);
    setIsNewEnvOpen(false);
    setNewEnv({ name: '', type: 'dev', status: 'active' });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium">Environments</div>
        <Dialog open={isNewEnvOpen} onOpenChange={setIsNewEnvOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="size-4" />
              New Environment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Environment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="env-name">Name</Label>
                <Input
                  id="env-name"
                  placeholder="e.g., Preview-123"
                  value={newEnv.name}
                  onChange={(e) => setNewEnv((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newEnv.type} onValueChange={(v) => setNewEnv((s) => ({ ...s, type: v as EnvironmentType }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prod">Production</SelectItem>
                      <SelectItem value="stage">Staging</SelectItem>
                      <SelectItem value="dev">Development</SelectItem>
                      <SelectItem value="test">Testing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newEnv.status}
                    onValueChange={(v) => setNewEnv((s) => ({ ...s, status: v as EnvironmentStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewEnvOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNewEnv} disabled={!newEnv.name.trim()}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {selectedProject?.environments.map((env) => {
          const active = env.id === selectedEnvId;
          return (
            <button
              key={env.id}
              onClick={() => onEnvSelect(env.id)}
              className={cn(
                'w-full rounded-md border px-3 py-2 text-left hover:bg-accent/50 transition',
                active && 'border-primary/50 bg-accent'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge className={cn('rounded-sm', ENV_TYPE_TONE[env.type])}>{ENV_TYPE_LABEL[env.type]}</Badge>
                  <span className="font-medium truncate">{env.name}</span>
                </div>
                <div 
                  className={cn('w-3 h-3 rounded-full', {
                    'bg-emerald-500': env.status === 'active',
                    'bg-zinc-400': env.status === 'inactive', 
                    'bg-orange-500': env.status === 'maintenance'
                  })}
                  title={env.status}
                />
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
