"use client"

import React from 'react'
import { Key, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Input from '@/components/app/form/Input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Variable } from '../../../service/types/project.response.types'

interface EditVariableDialogProps {
  variable: Variable | null
  isUpdating: boolean
  onChange: (updated: Variable) => void
  onSave: () => void
  onClose: () => void
}

export function EditVariableDialog({
  variable,
  isUpdating,
  onChange,
  onSave,
  onClose,
}: EditVariableDialogProps) {
  return (
    <Dialog open={!!variable} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] bg-background/95 backdrop-blur-xl border-border/40 p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold tracking-tight">Edit Variable</DialogTitle>
        </DialogHeader>

        {variable && (
          <div className="p-6">
            <div className="flex items-start gap-4 bg-muted/20 p-4 rounded-xl border border-border/40">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Key</label>
                    <Input
                      value={variable.key}
                      onChange={(e) => onChange({ ...variable, key: e.target.value.toUpperCase() })}
                      className="h-10 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Value</label>
                    <Input
                      value={variable.value}
                      onChange={(e) => onChange({ ...variable, value: e.target.value })}
                      type={variable.isSecret ? 'password' : 'text'}
                      className="h-10 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-7 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'size-10 rounded-lg transition-colors border',
                    variable.isSecret
                      ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                      : 'text-muted-foreground border-transparent hover:bg-muted'
                  )}
                  onClick={() => onChange({ ...variable, isSecret: !variable.isSecret })}
                  title={variable.isSecret ? 'Secret: Redacted in UI' : 'Mark as Secret'}
                >
                  {variable.isSecret ? <Key className="size-4" /> : <Layers className="size-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="py-3 px-6 bg-muted/30 border-t border-border/40 gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={onSave} loading={isUpdating}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
