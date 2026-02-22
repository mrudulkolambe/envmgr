"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FolderTree, MoreVertical, ExternalLink, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Project } from '../service/types/project.response.types'
import { projectService } from '../service/project.service'
import { ConfirmDeleteDialog } from '@/components/app/ConfirmDeleteDialog'
import { toast } from 'sonner'


interface ProjectCardProps {
  project: Project
  onDeleted?: () => void
}

export function ProjectCard({ project, onDeleted }: ProjectCardProps) {
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = () => {
    projectService.deleteProject(project.id, {
      onLoading: setIsDeleting,
      onSuccess: () => {
        setShowDelete(false)
        onDeleted?.()
      },
      onError: (err) => toast.error(`Failed to delete project: ${err}`),
    })
  }

  return (
    <>
      <div className="relative group">
        <Link
          href={`/dashboard/${project.id}`}
          className="flex flex-col justify-between rounded-xl border border-border/50 bg-background/40 backdrop-blur-sm p-5 transition-all duration-300 hover:border-primary/40 hover:bg-muted/30 hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.98]"
        >
          <div className="mb-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm shadow-primary/10">
                <FolderTree className="size-5" />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-muted"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 bg-background/95 backdrop-blur-xl border-border/40"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    onSelect={(e) => {
                      e.preventDefault()
                      setShowDelete(true)
                    }}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors tracking-tight leading-tight mb-1">
              {project.name}
            </h3>
            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-primary/80 shadow-[0_0_10px_rgba(var(--primary),0.5)] animate-pulse" />
              <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-tight antialiased">
                {Array.isArray(project.environments)
                  ? project.environments.length
                  : project.environments || 0}{' '}
                environments
              </span>
            </div>
            <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary transition-all opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0" />
          </div>
        </Link>
      </div>

      <ConfirmDeleteDialog
        open={showDelete}
        title="Delete Project"
        description="This will permanently delete the project and all related resources including environments and environment variables."
        nameConfirmation={project.name}
        phraseConfirmation="delete my project"
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setShowDelete(false)}
      />
    </>
  )
}
