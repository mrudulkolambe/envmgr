"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Logo } from '@/components/app/logo'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Loader2, 
  ArrowLeft, 
  Boxes, 
  Calendar,
  Activity,
  Key,
  Eye,
  EyeOff,
  Copy,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  MoreVertical,
  Terminal,
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { useUser } from '@/hooks/use-user'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import Input from '@/components/app/form/Input'
import { projectService } from '../../service/project.service'
import { Environment, Variable } from '../../service/types/project.response.types'
import { motion, AnimatePresence } from "framer-motion"
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'
import { AddVariableDialog } from './components/AddVariableDialog'
import { EditVariableDialog } from './components/EditVariableDialog'
import { DeleteVariableDialog } from './components/DeleteVariableDialog'
import { BulkEditDialog } from './components/BulkEditDialog'
import { ConfirmDeleteDialog } from '@/components/app/ConfirmDeleteDialog'
import { DashboardNav } from '@/components/app/DashboardNav'

export default function EnvironmentDetailsPage() {
  const { id, envId } = useParams() as { id: string, envId: string }
  const router = useRouter()
  const { user } = useUser()
  
  const [environment, setEnvironment] = useState<Environment | null>(null)
  const [variables, setVariables] = useState<Variable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingVars, setIsLoadingVars] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSecretId, setShowSecretId] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [draftVariables, setDraftVariables] = useState<{ id: string, key: string, value: string, isSecret: boolean }[]>([
    { id: Math.random().toString(36).substr(2, 9), key: '', value: '', isSecret: false }
  ])
  const [isSavingDrafts, setIsSavingDrafts] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [variableToDelete, setVariableToDelete] = useState<{ id: string, key: string } | null>(null)
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false)
  const [bulkEditText, setBulkEditText] = useState('')
  const [isSavingBulkEdit, setIsSavingBulkEdit] = useState(false)
  const [showDeleteEnvironment, setShowDeleteEnvironment] = useState(false)
  const [isDeletingEnvironment, setIsDeletingEnvironment] = useState(false)

  const fetchEnvironmentDetails = useCallback(() => {
    projectService.getEnvironment(
      envId,
      {
        onLoading: setIsLoading,
        onSuccess: (data) => {
          setEnvironment(data)
        },
        onError: (err) => {
          setError(err)
          console.error('Failed to fetch environment details:', err)
        }
      }
    )
  }, [envId])

  const fetchVariables = useCallback((search: string = '') => {
    projectService.listVariables(
      { environmentId: envId, search },
      {
        onLoading: setIsLoadingVars,
        onSuccess: (data) => {
          setVariables(data)
        },
        onError: (err) => {
          console.error('Failed to fetch variables:', err)
        }
      }
    )
  }, [envId])

  useEffect(() => {
    if (envId) {
      fetchEnvironmentDetails()
    }
  }, [envId, fetchEnvironmentDetails])

  const debouncedSearch = useDebounce(searchQuery, 400)

  useEffect(() => {
    if (envId) {
      fetchVariables(debouncedSearch)
    }
  }, [envId, debouncedSearch, fetchVariables])

  const filteredVariables = variables // Now server-side filtered

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const parseEnvText = (text: string) => {
    const lines = text.split('\n')
    const parsed = lines
      .filter(line => line.trim() && !line.trim().startsWith('#') && line.includes('='))
      .map(line => {
        const firstEqualIndex = line.indexOf('=')
        const key = line.substring(0, firstEqualIndex).trim()
        let value = line.substring(firstEqualIndex + 1).trim()
        
        // Remove surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1)
        }

        return {
          id: Math.random().toString(36).substr(2, 9),
          key,
          value,
          isSecret: /SECRET|PASSWORD|TOKEN|KEY|CREDENTIAL|AUTH|PWD/i.test(key)
        }
      })
    return parsed
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const text = e.clipboardData.getData('text')
    if (text.includes('\n') && text.includes('=')) {
      e.preventDefault()
      const newVars = parseEnvText(text)
      if (newVars.length > 0) {
        const updatedDrafts = [...draftVariables]
        // If the current row is empty, replace it, otherwise append after it
        if (!updatedDrafts[index].key && !updatedDrafts[index].value) {
          updatedDrafts.splice(index, 1, ...newVars)
        } else {
          updatedDrafts.splice(index + 1, 0, ...newVars)
        }
        setDraftVariables(updatedDrafts)
      }
    }
  }

  const updateDraftRow = (index: number, field: 'key' | 'value' | 'isSecret', val: any) => {
    const updated = [...draftVariables]
    updated[index] = { ...updated[index], [field]: val }
    
    // Auto-detect secret if key changes
    if (field === 'key') {
      updated[index].isSecret = /SECRET|PASSWORD|TOKEN|KEY|CREDENTIAL|AUTH|PWD/i.test(val)
    }
    
    setDraftVariables(updated)
  }

  const addDraftRow = () => {
    setDraftVariables([...draftVariables, { id: Math.random().toString(36).substr(2, 9), key: '', value: '', isSecret: false }])
  }

  const removeDraftRow = (id: string) => {
    if (draftVariables.length === 1) {
      setDraftVariables([{ id: Math.random().toString(36).substr(2, 9), key: '', value: '', isSecret: false }])
    } else {
      setDraftVariables(draftVariables.filter(v => v.id !== id))
    }
  }

  const openBulkEdit = () => {
    const text = variables
      .map(v => `${v.key}=${v.value}`)
      .join('\n')
    setBulkEditText(text)
    setIsBulkEditDialogOpen(true)
  }

  const saveBulkEdit = () => {
    const parsed = parseEnvText(bulkEditText)
    if (parsed.length === 0) return
    projectService.bulkUpdateVariables(
      {
        environmentId: envId,
        variables: parsed.map(({ key, value, isSecret }) => ({ key, value, isSecret }))
      },
      {
        onLoading: setIsSavingBulkEdit,
        onSuccess: () => {
          setIsBulkEditDialogOpen(false)
          setBulkEditText('')
          fetchVariables(debouncedSearch)
        },
        onError: (err) => {
          toast.error(`Failed to save variables: ${err}`)
        }
      }
    )
  }

  const saveDrafts = () => {
    const varsToSave = draftVariables.filter(v => v.key.trim())
    if (varsToSave.length === 0) return

    projectService.bulkUpdateVariables(
      {
        environmentId: envId,
        variables: varsToSave.map(({ key, value, isSecret }) => ({ key, value, isSecret }))
      },
      {
        onLoading: setIsSavingDrafts,
        onSuccess: () => {
          setIsAddDialogOpen(false)
          setDraftVariables([{ id: Math.random().toString(36).substr(2, 9), key: '', value: '', isSecret: false }])
          fetchVariables(debouncedSearch)
        },
        onError: (err) => {
          toast.error(`Failed to save variables: ${err}`)
        }
      }
    )
  }

  const handleDeleteVariable = () => {
    if (!variableToDelete) return;
    setIsDeleting(variableToDelete.id);
    projectService.deleteVariable(variableToDelete.id, {
      onLoading: (l) => {
        if (!l) {
          setIsDeleting(null);
          setVariableToDelete(null);
        }
      },
      onSuccess: () => {
        fetchVariables(debouncedSearch);
      },
      onError: (err) => {
        toast.error(`Failed to delete variable: ${err}`);
      }
    });
  }

  const handleUpdateVariable = () => {
    if (!editingVariable) return;
    projectService.updateVariable(
      editingVariable.id,
      {
        key: editingVariable.key,
        value: editingVariable.value,
        isSecret: editingVariable.isSecret
      },
      {
        onLoading: setIsUpdating,
        onSuccess: () => {
          setEditingVariable(null);
          fetchVariables(debouncedSearch);
        },
        onError: (err) => {
          toast.error(`Failed to update variable: ${err}`);
        }
      }
    );
  }

  if (isLoading && !environment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading environment...</p>
        </div>
      </div>
    )
  }

  if (error || !environment) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
           <Activity className="size-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Environment not found</h1>
        <p className="text-muted-foreground max-w-sm mb-8">
          The environment you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => router.push(`/dashboard/${id}`)}>
           Back to Project
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/30 relative">
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
            href={`/dashboard/${id}`} 
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest mb-6 group"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            Back to Project
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground leading-none uppercase">{environment.name}</h1>
                <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                  Connected
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium pt-1 flex items-center gap-2">
                <Boxes className="size-4 opacity-50" />
                Environment ID: <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">{environment.id}</code>
              </p>
              
              <div className="flex items-center gap-5 pt-4">
                 <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calendar className="size-3.5 opacity-50" />
                    Updated on {new Date(environment.updatedAt).toLocaleDateString()}
                 </div>
                 <div className="h-3 w-px bg-border" />
                 <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Key className="size-3.5 opacity-50" />
                    {variables.length} Variables
                 </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 border-destructive/30 text-destructive hover:bg-destructive/10 font-semibold"
                onClick={() => setShowDeleteEnvironment(true)}
              >
                <Trash2 className="size-4 mr-2 opacity-60" />
                Delete Environment
              </Button>
              {/* <Button variant="outline" size="sm" className="h-9 px-4 border-border/60 font-semibold">
                <Settings className="size-4 mr-2 opacity-60" />
                Config
              </Button> */}
            </div>
          </div>
        </motion.div>

        {/* Variables Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
             <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Key className="size-4 opacity-50" />
                Variables
             </h2>
             
             <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-full md:w-80">
                    <Input 
                       type="search" 
                       placeholder="Search variables..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={openBulkEdit}>
                      Bulk Edit
                  </Button>
                  <Button onClick={() => {
                    setDraftVariables([{ id: Math.random().toString(36).substr(2, 9), key: '', value: '', isSecret: false }])
                    setIsAddDialogOpen(true)
                  }}>
                      <Plus className="size-4 mr-2" />
                      Add Variable
                  </Button>
                </div>
             </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            {isLoadingVars ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-muted/20 animate-pulse border border-border/30" />
              ))
            ) : (
              <AnimatePresence mode='popLayout'>
                {filteredVariables.map((variable) => (
                  <motion.div
                     key={variable.id}
                     layout
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.98 }}
                     className="group grid grid-cols-3 items-center gap-4 p-4 rounded-2xl border border-border/40 bg-background/40 backdrop-blur-md hover:border-primary/20 hover:bg-muted/5 transition-all duration-300"
                   >
                     {/* Left: Icon and Key */}
                     <div className="flex items-center gap-4 min-w-0 juse">
                       <div className={cn(
                         "size-10 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-300 group-hover:scale-105",
                         variable.isSecret ? "bg-amber-500/5 border-amber-500/10 text-amber-500/60" : "bg-primary/5 border-primary/10 text-primary/60"
                       )}>
                         {variable.isSecret ? <Key className="size-5" /> : <Terminal className="size-5" />}
                       </div>
                       <p className="text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary leading-tight truncate">
                         {variable.key}
                       </p>
                     </div>

                     {/* Middle: Value — centered, fixed column, never expands */}
                     <div
                       className="flex items-center justify-center gap-2 cursor-pointer group/value overflow-hidden"
                       onClick={() => {
                         if (showSecretId !== variable.id) {
                           setShowSecretId(variable.id)
                         } else {
                           copyToClipboard(variable.value, `val-${variable.id}`)
                         }
                       }}
                     >
                       {showSecretId !== variable.id ? (
                         <>
                           <Eye className="size-3.5 text-muted-foreground/30 group-hover/value:text-muted-foreground/60 transition-colors shrink-0" />
                           <div className="flex gap-[3px] items-center shrink-0">
                             {Array.from({ length: 8 }).map((_, i) => (
                               <div key={i} className="size-[5px] rounded-full bg-muted-foreground/25 group-hover/value:bg-muted-foreground/40 transition-colors" />
                             ))}
                           </div>
                         </>
                       ) : (
                         <>
                           <EyeOff
                             className="size-3.5 text-muted-foreground/30 hover:text-emerald-500 transition-colors shrink-0"
                             onClick={(e) => {
                               e.stopPropagation()
                               setShowSecretId(null)
                             }}
                           />
                           <code className="text-[11px] font-mono text-muted-foreground group-hover/value:text-foreground transition-colors truncate min-w-0 block">
                             {variable.value}
                           </code>
                           {copiedKey === `val-${variable.id}` && (
                             <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                           )}
                         </>
                       )}
                     </div>

                     {/* Right: Meta + Actions */}
                     <div className="flex items-center gap-4 shrink-0 justify-end">
                        <p className="hidden md:block text-[11px] font-medium text-muted-foreground/60 whitespace-nowrap">
                           Added {new Date(variable.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                        <div className="size-8 rounded-full bg-linear-to-br from-primary/20 to-indigo-500/20 border border-white/5 flex items-center justify-center shadow-inner shrink-0">
                           <span className="text-[9px] font-bold text-primary/70">{user?.name?.substring(0,2).toUpperCase()}</span>
                        </div>
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                                 <MoreVertical className="size-4" />
                              </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-border/40">
                              <DropdownMenuItem onClick={() => copyToClipboard(variable.key, `key-${variable.id}`)}>
                                 <Copy className="size-4 mr-2" />
                                 Copy Key
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyToClipboard(variable.value, `val-${variable.id}`)}>
                                 <Copy className="size-4 mr-2" />
                                 Copy Value
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-border/40" />
                              <DropdownMenuItem className="text-primary" onClick={() => setEditingVariable(variable)}>
                                 <Edit2 className="size-4 mr-2" />
                                 Edit Variable
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                 className="text-destructive focus:text-destructive"
                                 onClick={() => setVariableToDelete({ id: variable.id, key: variable.key })}
                                 disabled={isDeleting === variable.id}
                              >
                                 {isDeleting === variable.id ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Trash2 className="size-4 mr-2" />}
                                 Delete Variable
                              </DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {isDeleting === variable.id && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                        <Loader2 className="size-6 animate-spin text-destructive" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {!isLoadingVars && filteredVariables.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center text-center bg-muted/5 rounded-3xl border border-dashed border-border/60">
                 <div className="size-20 rounded-full bg-muted/20 flex items-center justify-center mb-6">
                    <Search className="size-10 text-muted-foreground/20" />
                 </div>
                 <h3 className="text-xl font-bold text-foreground mb-2 uppercase tracking-tight">No variables found</h3>
                 <p className="text-sm text-muted-foreground max-w-xs font-medium">
                    {searchQuery ? `We couldn't find any variables matching "${searchQuery}".` : "This environment is currently empty. Start by adding your first variable."}
                 </p>
                 {!searchQuery && (
                   <Button className="mt-8 px-8 py-6 rounded-2xl shadow-lg shadow-primary/10 group" size="lg" onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="size-5 mr-2 transition-transform group-hover:rotate-90" />
                      Add First Variable
                   </Button>
                 )}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <AddVariableDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        draftVariables={draftVariables}
        isSaving={isSavingDrafts}
        onUpdateRow={updateDraftRow}
        onPaste={handlePaste}
        onAddRow={addDraftRow}
        onRemoveRow={removeDraftRow}
        onSave={saveDrafts}
        onCancel={() => {
          setIsAddDialogOpen(false)
          setDraftVariables([{ id: Math.random().toString(36).substr(2, 9), key: '', value: '', isSecret: false }])
        }}
      />

      <EditVariableDialog
        variable={editingVariable}
        isUpdating={isUpdating}
        onChange={setEditingVariable}
        onSave={handleUpdateVariable}
        onClose={() => setEditingVariable(null)}
      />

      <DeleteVariableDialog
        variableKey={variableToDelete?.key ?? null}
        isDeleting={!!isDeleting}
        onConfirm={handleDeleteVariable}
        onClose={() => setVariableToDelete(null)}
      />

      <BulkEditDialog
        open={isBulkEditDialogOpen}
        text={bulkEditText}
        isSaving={isSavingBulkEdit}
        detectedCount={parseEnvText(bulkEditText).length}
        onTextChange={setBulkEditText}
        onSave={saveBulkEdit}
        onClose={() => { setIsBulkEditDialogOpen(false); setBulkEditText('') }}
      />

      {environment && (
        <ConfirmDeleteDialog
          open={showDeleteEnvironment}
          title="Delete Environment"
          description="This will permanently delete this environment and all its variables. This action cannot be undone."
          nameConfirmation={environment.name}
          phraseConfirmation="delete my environment"
          isDeleting={isDeletingEnvironment}
          onConfirm={() => {
            projectService.deleteEnvironment(envId, {
              onLoading: setIsDeletingEnvironment,
              onSuccess: () => {
                setShowDeleteEnvironment(false)
                router.push(`/dashboard/${id}`)
              },
              onError: (err) => toast.error(`Failed to delete environment: ${err}`),
            })
          }}
          onClose={() => setShowDeleteEnvironment(false)}
        />
      )}

    </div>
  )
}
