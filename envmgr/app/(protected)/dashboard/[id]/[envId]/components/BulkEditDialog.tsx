"use client"

import React from 'react'
import { Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface BulkEditDialogProps {
  open: boolean
  text: string
  isSaving: boolean
  detectedCount: number
  onTextChange: (text: string) => void
  onSave: () => void
  onClose: () => void
}

export function BulkEditDialog({
  open,
  text,
  isSaving,
  detectedCount,
  onTextChange,
  onSave,
  onClose,
}: BulkEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[680px] bg-background/95 backdrop-blur-xl border-border/40 p-0 flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="size-5 text-primary/70" />
            Bulk Edit
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Edit your variables in{' '}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">.env</code> format. Each line
            should be{' '}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">KEY=value</code>. Lines starting
            with <code className="bg-muted px-1 py-0.5 rounded text-xs">#</code> are treated as
            comments.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 p-6 overflow-hidden">
          <Textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={'# Paste or type your variables here\nDATABASE_URL=postgresql://...\nAPI_KEY=your_api_key\nPORT=3000'}
            className="font-mono text-sm h-full min-h-[320px] resize-none bg-muted/20 border-border/40 focus:border-primary/40 leading-relaxed"
            spellCheck={false}
          />
        </div>

        <div className="px-6 pb-2">
          <p className="text-xs text-muted-foreground">
            {detectedCount} variable{detectedCount !== 1 ? 's' : ''} detected
          </p>
        </div>

        <DialogFooter className="py-3 px-6 bg-muted/30 border-t border-border/40 gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} loading={isSaving} disabled={detectedCount === 0}>
            Save {detectedCount > 0 ? `${detectedCount} Variables` : 'Variables'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
