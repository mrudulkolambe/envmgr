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
      <DialogContent className="sm:max-w-[800px] bg-background/95 backdrop-blur-xl border-border/40 max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-semibold tracking-tight">Add Environment Variables</DialogTitle>
          <DialogDescription className='text-sm'>
            Add variables one by one or paste a <code className="bg-muted px-1 py-0.5 rounded">.env</code> formatted text into any Key/Value field to auto-parse it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 max-h-[60vh]">
          <AnimatePresence initial={false}>
            {draftVariables.map((variable, index) => (
              <motion.div
                key={variable.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                className="flex items-start gap-4 group/row bg-muted/20 p-4 rounded-xl border border-border/40 hover:border-primary/20 transition-all"
              >
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <Input
                      label='KEY'
                        placeholder="e.g. DATABASE_URL"
                        value={variable.key}
                        onChange={(e) => onUpdateRow(index, 'key', e.target.value.toUpperCase())}
                        onPaste={(e) => onPaste(e, index)}
                        className="h-10 text-sm"
                      />
                      <Input
                      label='VALUE'
                        placeholder="Variable value"
                        value={variable.value}
                        onChange={(e) => onUpdateRow(index, 'value', e.target.value)}
                        onPaste={(e) => onPaste(e, index)}
                        type={variable.isSecret ? 'password' : 'text'}
                        className="h-10 text-sm"
                      />
                  </div>
                </div>

                <div className="pt-7 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'size-10 rounded-lg transition-colors border border-transparent',
                      variable.isSecret
                        ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                    onClick={() => onUpdateRow(index, 'isSecret', !variable.isSecret)}
                    title={variable.isSecret ? 'Secret: Redacted in UI' : 'Mark as Secret'}
                  >
                    {variable.isSecret ? <Key className="size-4" /> : <Layers className="size-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => onRemoveRow(variable.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Button
            variant="outline"
            className="w-full h-12 border-dashed border-border/60 hover:border-primary/40 text-muted-foreground hover:text-primary transition-all rounded-xl"
            onClick={onAddRow}
          >
            <Plus className="size-4 mr-2" />
            Add another variable
          </Button>
        </div>

        <DialogFooter className="py-3 px-6 bg-muted/30 border-t border-border/40 gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            loading={isSaving}
            className="px-10"
            disabled={!draftVariables.some((v) => v.key.trim())}
          >
            Save {draftVariables.filter((v) => v.key.trim()).length} Variables
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
