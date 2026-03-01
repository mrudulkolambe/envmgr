"use client"

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Input from '@/components/app/form/Input'
import { featureFlagService } from '../../../service/feature-flag.service'
import { toast } from 'sonner'
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
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
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
        else if (!/^[a-z0-9_]+$/.test(key)) newErrors.key = 'Invalid key format (only lowercase, numbers, and underscores)'

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
            <DialogContent className="p-0 gap-0 sm:max-w-md">
                <DialogHeader className="p-4 gap-1 border-b border-border/40">
                    <DialogTitle className="text-lg font-semibold tracking-tight">
                        Create Feature Flag
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Add a new feature flag to your project to control feature rollout.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="px-4 pb-4 space-y-4 pt-4">
                        <div className="space-y-2">
                            <Input
                                label='Flag Name'
                                placeholder="e.g. Beta Access"
                                value={name}
                                onChange={handleNameChange}
                                error={errors.name}
                                touched={!!errors.name}
                            />
                        </div>

                        <div className="space-y-2">
                            <Input
                                label='Unique Key'
                                placeholder="e.g. beta_access"
                                value={key}
                                onChange={(e) => setKey(generateKey(e.target.value))}
                                error={errors.key}
                                touched={!!errors.key}
                                description="Only lowercase letters, numbers, and underscores."
                            />
                        </div>

                        <div className="space-y-2">
                            <Input
                                label='Description (Optional)'
                                placeholder="What does this feature flag control?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="py-3 px-4 bg-muted/30 border-t border-border/40 gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleOpenChange(false)}
                            disabled={isLoading}
                            className="font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={isLoading}
                            className="font-semibold"
                        >
                            Create Flag
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
