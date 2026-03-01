"use client"

import React, { useState } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ConfirmDeleteDialogProps {
  open: boolean
  title: string
  description: string
  /** The exact string user must type to confirm ownership (e.g. env/project name) */
  nameConfirmation: string
  /** The exact phrase user must type as second confirmation */
  phraseConfirmation: string
  isDeleting: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  nameConfirmation,
  phraseConfirmation,
  isDeleting,
  onConfirm,
  onClose,
}: ConfirmDeleteDialogProps) {
  const [nameInput, setNameInput] = useState('')
  const [phraseInput, setPhraseInput] = useState('')

  const isValid = nameInput === nameConfirmation && phraseInput === phraseConfirmation

  const handleClose = () => {
    setNameInput('')
    setPhraseInput('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="p-0 gap-0 sm:max-w-md bg-background border-border/40">
        <DialogHeader className="p-4 gap-1 border-b border-border/40">
          <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2 text-destructive">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-4 pt-4">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              To confirm, type <span className="text-foreground border-b border-muted">"{nameConfirmation}"</span>
            </label>
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={nameConfirmation}
              className={cn(
                'h-10 text-sm transition-all',
                nameInput && nameInput !== nameConfirmation && 'border-destructive/40 focus-visible:ring-destructive/20',
                nameInput === nameConfirmation && 'border-emerald-500/40 focus-visible:ring-emerald-500/20'
              )}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              To confirm, type <span className="text-foreground border-b border-muted">"{phraseConfirmation}"</span>
            </label>
            <Input
              value={phraseInput}
              onChange={(e) => setPhraseInput(e.target.value)}
              placeholder={phraseConfirmation}
              className={cn(
                'h-10 text-sm transition-all',
                phraseInput && phraseInput !== phraseConfirmation && 'border-destructive/40 focus-visible:ring-destructive/20',
                phraseInput === phraseConfirmation && 'border-emerald-500/40 focus-visible:ring-emerald-500/20'
              )}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        <DialogFooter className="py-3 px-4 bg-muted/30 border-t border-border/40 gap-3">
          <Button variant="ghost" onClick={handleClose} disabled={isDeleting} className="font-semibold">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            loading={isDeleting}
            disabled={!isValid}
            className="font-semibold shadow-lg shadow-destructive/10"
          >
            {title}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
