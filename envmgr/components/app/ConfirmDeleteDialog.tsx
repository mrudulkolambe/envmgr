"use client"

import React, { useState } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
      <DialogContent className="sm:max-w-[480px] bg-background/95 backdrop-blur-xl border-border/40 p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-2 text-foreground">
            <Trash2 className="size-5 text-destructive" />
            {title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            {description}
          </p>
        </DialogHeader>

        <div className="px-6 pb-4 space-y-4 border-t border-border/40 pt-4">
          {/* Name confirmation */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">
              To confirm, type{' '}
              <strong className="text-foreground">"{nameConfirmation}"</strong>
            </label>
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={nameConfirmation}
              className={cn(
                'text-sm transition-colors',
                nameInput && nameInput !== nameConfirmation && 'border-destructive/50 focus-visible:ring-destructive/30',
                nameInput === nameConfirmation && 'border-emerald-500/50 focus-visible:ring-emerald-500/30'
              )}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {/* Phrase confirmation */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">
              To confirm, type{' '}
              <strong className="text-foreground">"{phraseConfirmation}"</strong>
            </label>
            <Input
              value={phraseInput}
              onChange={(e) => setPhraseInput(e.target.value)}
              placeholder={phraseConfirmation}
              className={cn(
                'text-sm transition-colors',
                phraseInput && phraseInput !== phraseConfirmation && 'border-destructive/50 focus-visible:ring-destructive/30',
                phraseInput === phraseConfirmation && 'border-emerald-500/50 focus-visible:ring-emerald-500/30'
              )}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        <DialogFooter className="py-3 px-6 bg-muted/30 border-t border-border/40 gap-3">
          <Button variant="ghost" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            loading={isDeleting}
            disabled={!isValid}
          >
            {title}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
