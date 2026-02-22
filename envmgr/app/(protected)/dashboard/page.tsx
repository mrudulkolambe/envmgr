"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import Input from '@/components/app/form/Input'
import { ProjectCard } from './components/projectcard'
import { CreateProjectDialog } from './components/create-project-dialog'
import { projectService } from './service/project.service'
import { Project, Pagination } from './service/types/project.response.types'
import { useDebounce } from '@/hooks/use-debounce'
import { DashboardNav } from '@/components/app/DashboardNav'
import { motion } from "framer-motion"

export default function DashboardPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  const [projects, setProjects] = useState<Project[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchProjects = useCallback((search: string = '') => {
    projectService.listProjects(
      { page: 1, limit: 12, search },
      {
        onLoading: setIsLoading,
        onSuccess: (response) => {
          setProjects(response.projects)
          setPagination(response.pagination)
        },
        onError: (err) => {
          console.error('Failed to fetch projects:', err)
        }
      }
    )
  }, [])

  const debouncedSearch = useDebounce(searchQuery, 400)

  useEffect(() => {
    fetchProjects(debouncedSearch)
  }, [debouncedSearch, fetchProjects])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/30 relative">
      {/* Background Decor from Landing */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="fixed top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full opacity-30 pointer-events-none" />

      {/* Navbar */}
      <DashboardNav />

      <main className="w-full px-8 py-10 relative z-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <h1 className="text-2xl font-bold tracking-tight text-foreground leading-none">Projects</h1>
            <p className="text-sm text-muted-foreground font-medium max-w-lg">Manage and organize your environment variables across distributed services.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="size-4" />
              New Project
            </Button>
          </motion.div>
        </div>

        {/* Search Area */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
           <div className="max-w-xs">
             <Input 
               type="search" 
               placeholder="Search projects..."
               value={searchQuery}
               onChange={handleSearch}
             />
           </div>
        </motion.div>

        {/* Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 gap-3"
        >
          {isLoading && projects.length === 0 ? (
            // Loading Skeletons or simple loader
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[200px] rounded-xl border border-border/50 bg-muted/20 animate-pulse flex items-center justify-center">
                 <Loader2 className="size-6 text-muted-foreground animate-spin opacity-20" />
              </div>
            ))
          ) : (
            <>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDeleted={() => fetchProjects(debouncedSearch)}
                />
              ))}

              
              {/* Create New Card */}
              <button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex h-full min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-5 transition-all hover:bg-primary/3 hover:border-primary/30 group bg-background/20 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="flex size-10 items-center justify-center rounded-full bg-muted border border-border group-hover:scale-110 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-500 mb-4 relative z-10">
                  <Plus className="size-5 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors relative z-10">
                  New project
                </p>
              </button>
            </>
          )}
        </motion.div>
      </main>

      <CreateProjectDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          fetchProjects(searchQuery)
        }}
      />
    </div>
  )
}