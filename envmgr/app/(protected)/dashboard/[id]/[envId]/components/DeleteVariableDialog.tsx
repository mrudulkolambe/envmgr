"use client"

import React from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface DeleteVariableDialogProps {
  variableKey: string | null
  isDeleting: boolean
  onConfirm: () => void
  onClose: () => void
}

export function DeleteVariableDialog({
  variableKey,
  isDeleting,
  onConfirm,
  onClose,
}: DeleteVariableDialogProps) {
  return (
    <Dialog open={!!variableKey} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-background/95 backdrop-blur-xl border-border/40 p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold tracking-tight text-destructive flex items-center gap-2">
            <Trash2 className="size-5" />
            Delete Variable
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-foreground font-mono bg-muted/50 px-1 py-0.5 rounded">
              {variableKey}
            </strong>
            ? This action cannot be undone.
          </p>
        </div>

        <DialogFooter className="py-3 px-6 bg-muted/30 border-t border-border/40 gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} loading={isDeleting}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
