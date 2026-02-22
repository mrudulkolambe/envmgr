"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/app/logo'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { LogOut, MessageSquare, CheckCircle2 } from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import API from '@/lib/api'
import { cn } from '@/lib/utils'
import { removeToken } from '@/lib/token'

interface DashboardNavProps {
  subtitle?: string
}

export function DashboardNav({ subtitle }: DashboardNavProps) {
  const router = useRouter()
  const { user } = useUser()

  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  const handleLogout = () => {
    removeToken()
    router.push('/login')
  }

  const handleFeedbackSubmit = async () => {
    if (feedbackText.trim().length < 10) {
      setFeedbackError('Please write at least 10 characters.')
      return
    }
    setFeedbackError(null)
    setIsSubmitting(true)
    const res = await API.post('/feedback', { description: feedbackText.trim() })
    setIsSubmitting(false)
    if (res.success) {
      setSubmitted(true)
      setFeedbackText('')
      setTimeout(() => {
        setSubmitted(false)
        setFeedbackOpen(false)
      }, 2000)
    } else {
      setFeedbackError(res.message || 'Failed to submit feedback.')
    }
  }

  const handleFeedbackClose = () => {
    setFeedbackOpen(false)
    setFeedbackText('')
    setFeedbackError(null)
    setSubmitted(false)
  }

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <Logo size="sm" />
              <div className="h-4 w-px bg-border mx-1" />
              <span className="text-sm font-semibold tracking-tight text-foreground transition-colors antialiased">
                {subtitle || `${user?.name || 'User'}'s Space`}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setFeedbackOpen(true)}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold hover:text-primary transition-colors uppercase tracking-widest opacity-50 hover:opacity-100"
            >
              <MessageSquare className="size-3.5" />
              Feedback
            </button>

            <div className="h-4 w-px bg-border" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="size-8 border border-border shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold uppercase">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-background/95 backdrop-blur-xl border-border/40">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem
                  className="md:hidden"
                  onSelect={() => { setFeedbackOpen(true) }}
                >
                  <MessageSquare className="size-4 mr-2" />
                  Feedback
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/40 md:hidden" />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onSelect={handleLogout}
                >
                  <LogOut className="size-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <Dialog open={feedbackOpen} onOpenChange={(o) => !o && handleFeedbackClose()}>
        <DialogContent className="sm:max-w-[440px] bg-background/95 backdrop-blur-xl border-border/40 p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <MessageSquare className="size-5 text-primary/70" />
              Send Feedback
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Share your thoughts, report bugs, or suggest improvements.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-4 space-y-3 border-t border-border/40 pt-4">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
                <CheckCircle2 className="size-10 text-emerald-500" />
                <p className="text-sm font-semibold text-foreground">Thanks for your feedback!</p>
                <p className="text-xs text-muted-foreground">We'll review it and get back to you if needed.</p>
              </div>
            ) : (
              <>
                <Textarea
                  placeholder="Describe your feedback, bug, or feature request..."
                  value={feedbackText}
                  onChange={(e) => {
                    setFeedbackText(e.target.value)
                    setFeedbackError(null)
                  }}
                  rows={5}
                  className={cn(
                    'resize-none text-sm bg-muted/30 border-border/50 focus-visible:ring-primary/30 transition-colors',
                    feedbackError && 'border-destructive/50 focus-visible:ring-destructive/30'
                  )}
                />
                {feedbackError && (
                  <p className="text-xs text-destructive font-medium">{feedbackError}</p>
                )}
                <p className="text-[11px] text-muted-foreground text-right">
                  {feedbackText.length} / 2000
                </p>
              </>
            )}
          </div>

          {!submitted && (
            <DialogFooter className="py-3 px-6 bg-muted/30 border-t border-border/40 gap-3">
              <Button variant="ghost" onClick={handleFeedbackClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleFeedbackSubmit} loading={isSubmitting}>
                Submit Feedback
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
