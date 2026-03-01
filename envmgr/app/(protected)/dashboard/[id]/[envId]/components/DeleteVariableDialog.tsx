"use client"

import React from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
      <DialogContent className="p-0 gap-0 sm:max-w-md bg-background border-border/40">
        <DialogHeader className="p-4 gap-1 border-b border-border/40">
          <DialogTitle className="text-lg font-semibold tracking-tight text-destructive flex items-center gap-2">
            Delete Variable
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            This action is permanent and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 pt-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-foreground font-mono bg-muted/50 px-1 py-0.5 rounded text-xs">
              {variableKey}
            </strong>
            ?
          </p>
        </div>

        <DialogFooter className="py-3 px-4 bg-muted/30 border-t border-border/40 gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isDeleting} className="font-semibold">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} loading={isDeleting} className="font-semibold shadow-lg shadow-destructive/10">
            Delete Variable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
