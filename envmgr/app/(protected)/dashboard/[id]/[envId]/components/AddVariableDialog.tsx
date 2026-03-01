"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Key, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Input from '@/components/app/form/Input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type DraftVariable = {
  id: string
  key: string
  value: string
  isSecret: boolean
}

interface AddVariableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  draftVariables: DraftVariable[]
  isSaving: boolean
  onUpdateRow: (index: number, field: 'key' | 'value' | 'isSecret', val: any) => void
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>, index: number) => void
  onAddRow: () => void
  onRemoveRow: (id: string) => void
  onSave: () => void
  onCancel: () => void
}

export function AddVariableDialog({
  open,
  onOpenChange,
  draftVariables,
  isSaving,
  onUpdateRow,
  onPaste,
  onAddRow,
  onRemoveRow,
  onSave,
  onCancel,
}: AddVariableDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0">
        <DialogHeader className="p-4 gap-1 border-b border-border/40">
          <DialogTitle className="text-lg font-semibold tracking-tight">Add Environment Variables</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add variables one by one or paste a <code className="bg-muted px-1 py-0.5 rounded">.env</code> formatted text into any Key/Value field to auto-parse it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 max-h-[60vh]">
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {draftVariables.map((variable, index) => (
                <motion.div
                  key={variable.id}
                  initial={{ opacity: 0, scale: 0.98, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -4 }}
                >
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-start pb-3 border-b border-border/40 last:border-0 group/row">
                    <div className="space-y-1">
                      <Input
                        placeholder="Key (e.g. API_URL)"
                        value={variable.key}
                        onChange={(e) => onUpdateRow(index, 'key', e.target.value.toUpperCase())}
                        onPaste={(e) => onPaste(e, index)}
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-1">
                      <Input
                        placeholder="Value"
                        value={variable.value}
                        onChange={(e) => onUpdateRow(index, 'value', e.target.value)}
                        onPaste={(e) => onPaste(e, index)}
                        type={variable.isSecret ? 'password' : 'text'}
                        autoComplete="off"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 h-11">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'size-8 rounded-md transition-all',
                          variable.isSecret
                            ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                            : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted'
                        )}
                        onClick={() => onUpdateRow(index, 'isSecret', !variable.isSecret)}
                        title={variable.isSecret ? 'Secret: Masked' : 'Mark as Secret'}
                      >
                        {variable.isSecret ? <Key className="size-4" /> : <Layers className="size-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                        onClick={() => onRemoveRow(variable.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            className="w-full border border-dashed border-border/60 hover:border-primary/40 text-muted-foreground hover:text-primary transition-all rounded-lg text-xs font-medium"
            onClick={onAddRow}
          >
            <Plus className="size-3.5 mr-1.5" />
            Add another variable
          </Button>
        </div>

        <DialogFooter className="py-3 px-4 bg-muted/30 border-t border-border/40 gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={isSaving} className="font-semibold">
            Cancel
          </Button>
          <Button
            onClick={onSave}
            loading={isSaving}
            className="font-semibold"
            disabled={!draftVariables.some((v) => v.key.trim())}
          >
            Save {draftVariables.filter((v) => v.key.trim()).length} Variables
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
