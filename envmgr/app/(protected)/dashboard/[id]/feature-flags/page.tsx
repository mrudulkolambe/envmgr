"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
    Plus,
    Loader2,
    ArrowLeft,
    Flag,
    Calendar,
    Layers,
    Activity,
    Search
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import Input from '@/components/app/form/Input'
import { projectService } from '../../service/project.service'
import { featureFlagService } from '../../service/feature-flag.service'
import { Project } from '../../service/types/project.response.types'
import { FeatureFlag } from '../../service/types/feature-flag.response.types'
import { motion, AnimatePresence } from "framer-motion"
import { useDebounce } from '@/hooks/use-debounce'
import { DashboardNav } from '@/components/app/DashboardNav'
import { FeatureFlagCard } from './components/FeatureFlagCard'
import { CreateFeatureFlagDialog } from './components/CreateFeatureFlagDialog'

export default function FeatureFlagsPage() {
    const { id } = useParams() as { id: string }
    const router = useRouter()

    const [project, setProject] = useState<Project | null>(null)
    const [flags, setFlags] = useState<FeatureFlag[]>([])
    const [isLoadingProject, setIsLoadingProject] = useState(true)
    const [isLoadingFlags, setIsLoadingFlags] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    const fetchProjectDetails = useCallback(() => {
        projectService.getProject(
            id,
            {
                onLoading: setIsLoadingProject,
                onSuccess: (data) => {
                    setProject(data)
                },
                onError: (err) => {
                    setError(err)
                    console.error('Failed to fetch project details:', err)
                }
            }
        )
    }, [id])

    const fetchFeatureFlags = useCallback((search: string = '') => {
        featureFlagService.listFeatureFlags(
            { projectId: id, search },
            {
                onLoading: setIsLoadingFlags,
                onSuccess: (data) => {
                    setFlags(data)
                },
                onError: (err) => {
                    console.error('Failed to fetch feature flags:', err)
                    toast.error(`Failed to fetch feature flags: ${err}`)
                }
            }
        )
    }, [id])

    useEffect(() => {
        if (id) {
            fetchProjectDetails()
        }
    }, [id, fetchProjectDetails])

    const debouncedSearch = useDebounce(searchQuery, 400)

    useEffect(() => {
        if (id) {
            fetchFeatureFlags(debouncedSearch)
        }
    }, [id, debouncedSearch, fetchFeatureFlags])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleUpdateFlag = (updatedFlag: FeatureFlag) => {
        setFlags(prev => prev.map(f => f.id === updatedFlag.id ? updatedFlag : f))
    }

    if (isLoadingProject && !project) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading project details...</p>
                </div>
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
                <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                    <Activity className="size-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Project not found</h1>
                <p className="text-muted-foreground max-w-sm mb-8">
                    The project you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Button onClick={() => router.push('/dashboard')}>
                    Back to Dashboard
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/30 relative">
            {/* Background Decor */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="fixed top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full opacity-30 pointer-events-none" />

            {/* Navbar */}
            <DashboardNav subtitle={`FeatureFlags — ${project.name}`} />

            <main className="w-full px-8 py-10 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <Link
                        href={`/dashboard/${id}`}
                        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest mb-6 group"
                    >
                        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                        Back to Project
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground leading-none">Feature Flags</h1>
                                <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider">
                                    Management
                                </div>
                            </div>
                            <p className="text-base text-muted-foreground font-medium max-w-2xl pt-1">
                                Manage feature flags for <span className="text-foreground font-bold">{project.name}</span>. Control feature availability without code deployments.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg shadow-primary/20">
                                <Plus className="size-4 mr-2" />
                                Create Flag
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Flag className="size-4 opacity-50" />
                            Active Flags ({flags.length})
                        </h2>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                                <Input
                                    type="search"
                                    placeholder="Search by name or key..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence mode="popLayout">
                            {isLoadingFlags ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-[180px] rounded-2xl border border-border/50 bg-muted/20 animate-pulse" />
                                ))
                            ) : (
                                <>
                                    {flags.map((flag) => (
                                        <FeatureFlagCard
                                            key={flag.id}
                                            flag={flag}
                                            onDeleted={() => fetchFeatureFlags(debouncedSearch)}
                                            onUpdated={handleUpdateFlag}
                                        />
                                    ))}

                                    {flags.length === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-border/60 rounded-3xl bg-muted/5 text-center"
                                        >
                                            <div className="size-16 rounded-3xl bg-muted/50 flex items-center justify-center mb-6">
                                                <Flag className="size-8 text-muted-foreground/20" />
                                            </div>
                                            <p className="text-lg font-bold text-foreground">No feature flags found</p>
                                            <p className="text-sm text-muted-foreground max-w-xs mt-2">
                                                {searchQuery ? "Try adjusting your search terms to find what you're looking for." : "Start by creating your first feature flag to control your application's behavior."}
                                            </p>
                                            {!searchQuery && (
                                                <Button variant="outline" className="mt-8 border-primary/20 text-primary hover:bg-primary/5" onClick={() => setIsCreateOpen(true)}>
                                                    <Plus className="size-4 mr-2" />
                                                    Create First Flag
                                                </Button>
                                            )}
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            <CreateFeatureFlagDialog
                open={isCreateOpen}
                projectId={id}
                onOpenChange={setIsCreateOpen}
                onSuccess={() => fetchFeatureFlags(debouncedSearch)}
            />
        </div>
    )
}
