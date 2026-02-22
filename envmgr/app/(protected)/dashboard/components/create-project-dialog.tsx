"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Input from "@/components/app/form/Input"
import { projectService } from "../service/project.service"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateProjectDialog({ open, onOpenChange, onSuccess }: CreateProjectDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (name.trim().length < 3) {
      setError('Project name must be at least 3 characters')
      return
    }

    projectService.createProject(
      { name, description },
      {
        onLoading: setLoading,
        onSuccess: () => {
          setName('')
          setDescription('')
          onSuccess()
          onOpenChange(false)
        },
        onError: (err) => {
          setError(err)
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/50 bg-background/95 backdrop-blur-xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold tracking-tight">Create New Project</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground font-medium">
            Add a new project to organize your environment variables and services.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="px-6 pb-4 space-y-4 border-t border-border/40 pt-4">
            <Input
              id="name"
              label="Project Name"
              placeholder="e.g. EnvMgr Backend"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={error}
              touched={!!error}
              autoComplete="off"
            />
            <Input
              id="description"
              label="Description"
              placeholder="e.g. Main production API for the retail platform"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoComplete="off"
            />
          </div>
          <DialogFooter className="py-3 px-6 bg-muted/30 border-t border-border/40 gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20"
            >
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
