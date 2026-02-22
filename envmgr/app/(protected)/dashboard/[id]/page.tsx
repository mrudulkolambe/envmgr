"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Plus,
  Loader2,
  ArrowLeft,
  Boxes,
  Settings,
  Calendar,
  Layers,
  Activity,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import Input from '@/components/app/form/Input'
import { projectService } from '../service/project.service'
import { Project, Environment } from '../service/types/project.response.types'
import { motion } from "framer-motion"
import { useDebounce } from '@/hooks/use-debounce'
import { EnvironmentCard } from './components/environment-card'
import { ConfirmDeleteDialog } from '@/components/app/ConfirmDeleteDialog'
import { DashboardNav } from '@/components/app/DashboardNav'
import { CreateEnvironmentDialog } from './components/CreateEnvironmentDialog'

export default function ProjectDetailsPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()

  const [project, setProject] = useState<Project | null>(null)
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(true)
  const [isLoadingEnvs, setIsLoadingEnvs] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [envSearchQuery, setEnvSearchQuery] = useState('')
  const [showDeleteProject, setShowDeleteProject] = useState(false)
  const [isDeletingProject, setIsDeletingProject] = useState(false)
  const [isCreateEnvOpen, setIsCreateEnvOpen] = useState(false)

  const fetchProjectDetails = useCallback(() => {
    projectService.getProject(
      id,
      {
        onLoading: setIsLoadingDetails,
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

  const fetchEnvironments = useCallback((search: string = '') => {
    projectService.listEnvironments(
      { projectId: id, search },
      {
        onLoading: setIsLoadingEnvs,
        onSuccess: (data) => {
          setEnvironments(data)
        },
        onError: (err) => {
          console.error('Failed to fetch environments:', err)
        }
      }
    )
  }, [id])

  useEffect(() => {
    if (id) {
      fetchProjectDetails()
    }
  }, [id, fetchProjectDetails])

  const debouncedEnvSearch = useDebounce(envSearchQuery, 400)

  useEffect(() => {
    if (id) {
      fetchEnvironments(debouncedEnvSearch)
    }
  }, [id, debouncedEnvSearch, fetchEnvironments])

  const handleEnvSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnvSearchQuery(e.target.value)
  }

  const handleDeleteProject = () => {
    projectService.deleteProject(id, {
      onLoading: setIsDeletingProject,
      onSuccess: () => {
        setShowDeleteProject(false)
        router.push('/dashboard')
      },
      onError: (err) => toast.error(`Failed to delete project: ${err}`),
    })
  }

  if (isLoadingDetails && !project) {
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
      <DashboardNav />

      <main className="w-full px-8 py-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest mb-6 group"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            Back to Projects
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground leading-none">{project.name}</h1>
                <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider">
                  Active
                </div>
              </div>
              <p className="text-base text-muted-foreground font-medium max-w-2xl pt-1">{project.description}</p>
              
              <div className="flex items-center gap-5 pt-4">
                 <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calendar className="size-3.5 opacity-50" />
                    Created on {new Date(project.createdAt).toLocaleDateString()}
                 </div>
                 <div className="h-3 w-px bg-border" />
                 <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Layers className="size-3.5 opacity-50" />
                    {project.environments || 0} Environments
                 </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 border-destructive/30 text-destructive hover:bg-destructive/10 font-semibold"
                onClick={() => setShowDeleteProject(true)}
              >
                <Trash2 className="size-4 mr-2 opacity-60" />
                Delete Project
              </Button>
              {/* <Button variant="outline" size="sm" className="h-9 px-4 border-border/60 font-semibold">
                <Settings className="size-4 mr-2 opacity-60" />
                Settings
              </Button> */}
            </div>
          </div>
        </motion.div>

        {/* Environments Grid */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
             <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Boxes className="size-4 opacity-50" />
                Environments
             </h2>
             
             <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="w-full md:w-64">
                 <Input 
                   type="search" 
                   placeholder="Search environments..." 
                   value={envSearchQuery}
                   onChange={handleEnvSearch}
                 />
               </div>
               <Button onClick={() => setIsCreateEnvOpen(true)}>
                  <Plus className="size-3.5 mr-1.5" />
                  Add Environment
               </Button>
             </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {isLoadingEnvs ? (
               Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[180px] rounded-2xl border border-border/50 bg-muted/20 animate-pulse flex items-center justify-center">
                   <Loader2 className="size-6 text-muted-foreground animate-spin opacity-20" />
                </div>
              ))
            ) : (
              <>
                {environments.map((env) => (
                  <EnvironmentCard
                    key={env.id}
                    projectId={id}
                    environment={env}
                    onDeleted={() => fetchEnvironments(debouncedEnvSearch)}
                  />
                ))}

                {environments.length === 0 && (
                   <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-border/60 rounded-2xl bg-muted/5">
                      <Boxes className="size-8 text-muted-foreground/20 mb-4" />
                      <p className="text-sm font-medium text-muted-foreground">No environments yet.</p>
                      <p className="text-xs text-muted-foreground/60">Create one to get started.</p>
                   </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </main>

      {project && (
        <ConfirmDeleteDialog
          open={showDeleteProject}
          title="Delete Project"
          description={`This will permanently delete the project and all related resources including environments and environment variables.`}
          nameConfirmation={project.name}
          phraseConfirmation="delete my project"
          isDeleting={isDeletingProject}
          onConfirm={handleDeleteProject}
          onClose={() => setShowDeleteProject(false)}
        />
      )}

      <CreateEnvironmentDialog
        open={isCreateEnvOpen}
        projectId={id}
        onOpenChange={setIsCreateEnvOpen}
        onSuccess={() => fetchEnvironments(debouncedEnvSearch)}
      />
    </div>
  )
}
