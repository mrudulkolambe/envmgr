"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Boxes, MoreVertical, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Environment } from '../../service/types/project.response.types'
import { projectService } from '../../service/project.service'
import { ConfirmDeleteDialog } from '@/components/app/ConfirmDeleteDialog'
import { toast } from 'sonner'

interface EnvironmentCardProps {
  projectId: string
  environment: Environment
  onDeleted?: () => void
}

export function EnvironmentCard({ projectId, environment, onDeleted }: EnvironmentCardProps) {
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = () => {
    projectService.deleteEnvironment(environment.id, {
      onLoading: setIsDeleting,
      onSuccess: () => {
        setShowDelete(false)
        onDeleted?.()
      },
      onError: (err) => toast.error(`Failed to delete environment: ${err}`),
    })
  }

  return (
    <>
      <div className="relative group">
        <Link
          href={`/dashboard/${projectId}/${environment.id}`}
          className="block p-5 rounded-2xl border border-border/50 bg-background/40 backdrop-blur-sm hover:border-primary/40 hover:bg-muted/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.99] overflow-hidden"
        >
          <div className="flex items-start justify-between mb-8">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm shadow-primary/10">
              <Boxes className="size-5" />
            </div>

            {/* Dropdown — stops link navigation */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-muted/50"
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
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors tracking-tight mb-1">
              {environment.name}
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
              {Array.isArray(environment.variables)
                ? environment.variables.length
                : environment.variables || 0}{' '}
              Variables
            </div>
          </div>
        </Link>
      </div>

      <ConfirmDeleteDialog
        open={showDelete}
        title="Delete Environment"
        description="This will permanently delete this environment and all its variables. This action cannot be undone."
        nameConfirmation={environment.name}
        phraseConfirmation="delete my environment"
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setShowDelete(false)}
      />
    </>
  )
}
