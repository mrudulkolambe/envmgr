"use client"

import React, { useState, useEffect, useCallback } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Input from "@/components/app/form/Input"
import { projectService } from "../../service/project.service"
import {
    Key,
    Copy,
    Check,
    Plus,
    Loader2,
    AlertCircle
} from "lucide-react"
import { toast } from 'sonner'

interface ApiKeysDialogProps {
    open: boolean
    projectId: string
    onOpenChange: (open: boolean) => void
}

export function ApiKeysDialog({
    open,
    projectId,
    onOpenChange,
}: ApiKeysDialogProps) {
    const [keys, setKeys] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [creating, setCreating] = useState(false)
    const [newName, setNewName] = useState('')
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const fetchKeys = useCallback(() => {
        projectService.listApiKeys(
            projectId,
            {
                onLoading: setLoading,
                onSuccess: (data) => setKeys(data),
                onError: (err) => toast.error(`Failed to fetch API keys: ${err}`)
            }
        )
    }, [projectId])

    useEffect(() => {
        if (open && projectId) {
            fetchKeys()
        }
    }, [open, projectId, fetchKeys])

    const handleCreateKey = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return

        projectService.createApiKey(
            projectId,
            { name: newName.trim() },
            {
                onLoading: setCreating,
                onSuccess: (newKey) => {
                    setKeys([newKey, ...keys])
                    setNewName('')
                    toast.success('API key created successfully')
                },
                onError: (err) => toast.error(`Failed to create API key: ${err}`)
            }
        )
    }

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        toast.success('Key copied to clipboard')
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-background border border-border/50 shadow-2xl">
                <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/20">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Key className="size-4 text-primary" />
                        </div>
                        <DialogTitle className="text-xl font-bold tracking-tight">SDK API Keys</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground font-medium">
                        Use these keys to authenticate your web application with Envmgr.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Create New Key */}
                    <form onSubmit={handleCreateKey} className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Plus className="size-3" />
                            Generate New Key
                        </h3>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    className="h-9 text-sm"
                                    placeholder="e.g. Production Web App"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                            <Button type="submit" size="sm" className="h-9 px-4 font-semibold" disabled={creating || !newName.trim()}>
                                {creating ? <Loader2 className="size-4 animate-spin" /> : 'Generate'}
                            </Button>
                        </div>
                    </form>

                    <div className="h-px bg-border/40" />

                    {/* List existing keys */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Key className="size-3" />
                            Existing Keys
                        </h3>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-3 opacity-40">
                                <Loader2 className="size-6 animate-spin" />
                                <p className="text-xs font-medium">Fetching keys...</p>
                            </div>
                        ) : keys.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-border/60 rounded-xl bg-muted/5">
                                <AlertCircle className="size-6 text-muted-foreground/30 mb-2" />
                                <p className="text-xs font-medium text-muted-foreground">No API keys yet.</p>
                                <p className="text-[10px] text-muted-foreground/60">Generate one to start using the SDK.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {keys.map((key) => (
                                    <div key={key.id} className="group p-3 rounded-xl border border-border/50 bg-muted/5 hover:bg-muted/10 transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold tracking-tight">{key.name}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                Added {new Date(key.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-background border border-border/40 rounded-lg px-2 py-1.5 ring-1 ring-inset ring-transparent group-hover:ring-primary/20 transition-all">
                                            <code className="flex-1 text-[10px] font-mono font-medium text-muted-foreground truncate opacity-80">
                                                {key.key}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7 hover:bg-muted"
                                                onClick={() => copyToClipboard(key.key, key.id)}
                                            >
                                                {copiedId === key.id ? (
                                                    <Check className="size-3 text-green-500" />
                                                ) : (
                                                    <Copy className="size-3" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-muted/30 border-t border-border/40 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="font-semibold px-6">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
