'use client';

import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Environment, EnvironmentStatus, EnvironmentType } from '@/types';

interface EnvironmentSettingsDialogProps {
  environment: Environment | null;
  onUpdateEnvironment: (updates: Partial<Environment>) => void;
  onDeleteEnvironment: () => void;
}

export function EnvironmentSettingsDialog({ 
  environment, 
  onUpdateEnvironment, 
  onDeleteEnvironment 
}: EnvironmentSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(environment?.name || '');
  const [type, setType] = useState<EnvironmentType>(environment?.type || 'dev');
  const [status, setStatus] = useState<EnvironmentStatus>(environment?.status || 'active');

  React.useEffect(() => {
    if (environment) {
      setName(environment.name);
      setType(environment.type);
      setStatus(environment.status);
    }
  }, [environment]);

  const handleSave = () => {
    if (!environment) return;
    
    onUpdateEnvironment({
      name: name.trim(),
      type,
      status,
    });
    setOpen(false);
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={!environment} title="Environment Settings">
          <Settings className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Environment Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="env-name">Environment Name</Label>
            <Input
              id="env-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter environment name"
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as EnvironmentType)}>
              <SelectTrigger className="w-full">
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
            <Select value={status} onValueChange={(v) => setStatus(v as EnvironmentStatus)}>
              <SelectTrigger className="w-full">
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
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
