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
import { projectService } from "../../service/project.service"

interface CreateEnvironmentDialogProps {
  open: boolean
  projectId: string
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateEnvironmentDialog({
  open,
  projectId,
  onOpenChange,
  onSuccess,
}: CreateEnvironmentDialogProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (name.trim().length < 1) {
      setError('Environment name is required')
      return
    }
    if (name.trim().length > 50) {
      setError('Environment name must be at most 50 characters')
      return
    }

    projectService.createEnvironment(
      { name: name.trim(), projectId },
      {
        onLoading: setLoading,
        onSuccess: () => {
          setName('')
          onSuccess()
          onOpenChange(false)
        },
        onError: (err) => setError(err),
      }
    )
  }

  const handleClose = () => {
    setName('')
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md border-border/50 bg-background/95 backdrop-blur-xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Add Environment
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground font-medium">
            Create a new environment to manage a separate set of variables (e.g. dev, staging, production).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 pb-4 space-y-4 border-t border-border/40 pt-4">
            <Input
              id="env-name"
              label="Environment Name"
              placeholder="e.g. production"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              error={error}
              touched={!!error}
              autoComplete="off"
            />
          </div>

          <DialogFooter className="py-3 px-6 bg-muted/30 border-t border-border/40 gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="font-semibold"
            >
              Create Environment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
