"use client"

import React, { useState } from 'react'
import { FeatureFlag } from '../../../service/types/feature-flag.response.types'
import { featureFlagService } from '../../../service/feature-flag.service'
import { toast } from 'sonner'
import {
    Settings,
    Trash2,
    Calendar,
    Key,
    MoreVertical,
    ToggleLeft,
    ToggleRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDeleteDialog } from '@/components/app/ConfirmDeleteDialog'
import { motion } from "framer-motion"
import { cn } from '@/lib/utils'

interface FeatureFlagCardProps {
    flag: FeatureFlag
    onDeleted: () => void
    onUpdated: (flag: FeatureFlag) => void
}

export function FeatureFlagCard({ flag, onDeleted, onUpdated }: FeatureFlagCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    const handleToggle = () => {
        featureFlagService.updateFeatureFlag(
            flag.id,
            { isActive: !flag.isActive },
            {
                onLoading: setIsUpdating,
                onSuccess: (updated) => {
                    onUpdated(updated)
                    toast.success(`Feature flag "${flag.name}" ${updated.isActive ? 'enabled' : 'disabled'}`)
                },
                onError: (err) => toast.error(`Failed to update feature flag: ${err}`)
            }
        )
    }

    const handleDelete = () => {
        featureFlagService.deleteFeatureFlag(flag.id, {
            onLoading: setIsDeleting,
            onSuccess: () => {
                setShowDeleteDialog(false)
                onDeleted()
                toast.success(`Feature flag "${flag.name}" deleted`)
            },
            onError: (err) => toast.error(`Failed to delete feature flag: ${err}`)
        })
    }

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-card hover:bg-accent/5 transition-all duration-300 rounded-2xl border border-border/50 hover:border-primary/30 p-5 overflow-hidden shadow-sm hover:shadow-md"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                            {flag.name}
                            {flag.isActive ? (
                                <div className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">
                                    Enabled
                                </div>
                            ) : (
                                <div className="px-1.5 py-0.5 rounded-full bg-muted border border-border/50 text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                                    Disabled
                                </div>
                            )}
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/70 bg-muted/50 px-2 py-0.5 rounded w-fit">
                            <Key className="size-3" />
                            {flag.key}
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                                onSelect={handleToggle}
                                className={cn(flag.isActive ? "text-amber-500" : "text-emerald-500")}
                            >
                                {flag.isActive ? <ToggleLeft className="size-4 mr-2" /> : <ToggleRight className="size-4 mr-2" />}
                                {flag.isActive ? "Disable" : "Enable"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setShowDeleteDialog(true)}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                                <Trash2 className="size-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] mb-4">
                    {flag.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/60">
                        <Calendar className="size-3" />
                        Created {new Date(flag.createdAt).toLocaleDateString()}
                    </div>

                    <Button
                        variant={flag.isActive ? "default" : "outline"}
                        size="sm"
                        className={cn(
                            "h-7 px-3 text-[10px] font-bold uppercase tracking-wider transition-all",
                            flag.isActive ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-700/50" : "hover:bg-accent"
                        )}
                        onClick={handleToggle}
                        disabled={isUpdating}
                    >
                        {isUpdating ? "..." : (flag.isActive ? "Enabled" : "Disabled")}
                    </Button>
                </div>
            </motion.div>

            <ConfirmDeleteDialog
                open={showDeleteDialog}
                title="Delete Feature Flag"
                description={`This will permanently delete the feature flag "${flag.name}" (${flag.key}).`}
                nameConfirmation={flag.name}
                phraseConfirmation="delete my flag"
                isDeleting={isDeleting}
                onConfirm={handleDelete}
                onClose={() => setShowDeleteDialog(false)}
            />
        </>
    )
}
