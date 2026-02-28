"use client"

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Input from '@/components/app/form/Input'
import { Textarea } from '@/components/ui/textarea'
import { featureFlagService } from '../../../service/feature-flag.service'
import { toast } from 'sonner'
import { Flag, Keyboard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateFeatureFlagDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: string
    onSuccess: () => void
}

export function CreateFeatureFlagDialog({
    open,
    onOpenChange,
    projectId,
    onSuccess,
}: CreateFeatureFlagDialogProps) {
    const [name, setName] = useState('')
    const [key, setKey] = useState('')
    const [description, setDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const resetForm = () => {
        setName('')
        setKey('')
        setDescription('')
        setErrors({})
    }

    const handleOpenChange = (o: boolean) => {
        if (!o) resetForm()
        onOpenChange(o)
    }

    const generateKey = (val: string) => {
        return val
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setName(val)
        if (!key || key === generateKey(name)) {
            setKey(generateKey(val))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        const newErrors: Record<string, string> = {}
        if (!name.trim()) newErrors.name = 'Name is required'
        if (!key.trim()) newErrors.key = 'Key is required'
        else if (!/^[a-z0-9_-]+$/.test(key)) newErrors.key = 'Invalid key format'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        featureFlagService.createFeatureFlag(
            { name, key, description, projectId, isActive: false },
            {
                onLoading: setIsLoading,
                onSuccess: () => {
                    toast.success(`Feature flag "${name}" created successfully`)
                    handleOpenChange(false)
                    onSuccess()
                },
                onError: (err, status) => {
                    if (status === 400 && typeof err === 'string' && err.includes('exists')) {
                        setErrors({ key: 'Key already exists in this project' })
                    } else {
                        toast.error(err || 'Failed to create feature flag')
                    }
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-2xl border-border/40 p-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                <DialogHeader className="px-8 pt-8 pb-6 border-b border-border/40 relative z-10">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                        <Flag className="size-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Create Feature Flag</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Add a new feature flag to your project to control feature rollout.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                            Flag Name
                        </label>
                        <Input
                            placeholder="e.g. Beta Access"
                            value={name}
                            onChange={handleNameChange}
                            // autoFocus
                            className={cn(errors.name && "border-destructive focus-visible:ring-destructive/30")}
                        />
                        {errors.name && <p className="text-[10px] font-bold text-destructive uppercase tracking-wider">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1.5">
                                <Keyboard className="size-3.5" />
                                Unique Key
                            </label>
                        </div>
                        <Input
                            placeholder="e.g. beta-access"
                            value={key}
                            onChange={(e) => setKey(generateKey(e.target.value))}
                            className={cn("font-mono text-sm", errors.key && "border-destructive focus-visible:ring-destructive/30")}
                        />
                        <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                            Use this key in your code to check if the flag is enabled. Only lowercase letters, numbers, and hyphens.
                        </p>
                        {errors.key && <p className="text-[10px] font-bold text-destructive uppercase tracking-wider">{errors.key}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                            Description (Optional)
                        </label>
                        <Textarea
                            placeholder="What does this feature flag control?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="resize-none h-24 bg-muted/30 border-border/50 focus-visible:ring-primary/30 transition-colors"
                        />
                    </div>
                </form>

                <DialogFooter className="px-8 py-6 bg-muted/30 border-t border-border/40 gap-3 relative z-10">
                    <Button
                        variant="ghost"
                        onClick={() => handleOpenChange(false)}
                        disabled={isLoading}
                        className="font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        loading={isLoading}
                        className="px-8 shadow-lg shadow-primary/20"
                    >
                        Create Flag
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
