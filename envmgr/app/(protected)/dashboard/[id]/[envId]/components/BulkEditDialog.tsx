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
      <DialogContent className="sm:max-w-2xl bg-background border-border/40 p-0 flex flex-col max-h-[90vh] gap-0">
        <DialogHeader className="p-4 gap-1 border-b border-border/40">
          <DialogTitle className="text-lg font-semibold tracking-tight">Bulk Edit</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Edit your variables in <code className="bg-muted px-1 py-0.5 rounded text-[10px]">.env</code> format. Each line should be <code className="bg-muted px-1 py-0.5 rounded text-[10px]">KEY=value</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 p-4 overflow-hidden space-y-3">
          <Textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={'# Paste or type your variables here\nDATABASE_URL=postgresql://...\nAPI_KEY=your_api_key\nPORT=3000'}
            className="font-mono text-sm h-full min-h-[320px] resize-none bg-muted/20 border-border/40 focus:border-primary/40 leading-relaxed shadow-none"
            spellCheck={false}
          />
        </div>

        <DialogFooter className="py-3 px-4 bg-muted/30 border-t border-border/40 gap-3 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            {detectedCount} variable{detectedCount !== 1 ? 's' : ''} detected
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isSaving} className="font-semibold">
              Cancel
            </Button>
            <Button onClick={onSave} loading={isSaving} disabled={detectedCount === 0} className="font-semibold">
              Save {detectedCount > 0 ? `${detectedCount} Variables` : 'Variables'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
