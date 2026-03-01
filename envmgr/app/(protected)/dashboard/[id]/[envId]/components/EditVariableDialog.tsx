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
  DialogDescription,
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
      <DialogContent className="p-0 gap-0 sm:max-w-xl bg-background border-border/40">
        <DialogHeader className="p-4 gap-1 border-b border-border/40">
          <DialogTitle className="text-lg font-semibold tracking-tight">Edit Variable</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Modify the key, value, or visibility of this environment variable.
          </DialogDescription>
        </DialogHeader>

        {variable && (
          <div className="p-4">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end p-3 rounded-xl border border-border/40 bg-muted/5 group/row">
              <div className="space-y-1">
                <Input
                  label="Key"
                  placeholder="e.g. DATABASE_URL"
                  value={variable.key}
                  onChange={(e) => onChange({ ...variable, key: e.target.value.toUpperCase() })}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1">
                <Input
                  label="Value"
                  placeholder="Variable value"
                  value={variable.value}
                  onChange={(e) => onChange({ ...variable, value: e.target.value })}
                  type={variable.isSecret ? 'password' : 'text'}
                  autoComplete="off"
                />
              </div>

              <div className="flex items-center gap-1.5 h-10 pb-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'size-9 rounded-lg transition-all border border-transparent',
                    variable.isSecret
                      ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                  onClick={() => onChange({ ...variable, isSecret: !variable.isSecret })}
                  title={variable.isSecret ? 'Secret: Masked' : 'Mark as Secret'}
                >
                  {variable.isSecret ? <Key className="size-4" /> : <Layers className="size-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="py-3 px-4 bg-muted/30 border-t border-border/40 gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isUpdating} className="font-semibold">
            Cancel
          </Button>
          <Button onClick={onSave} loading={isUpdating} className="font-semibold">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
