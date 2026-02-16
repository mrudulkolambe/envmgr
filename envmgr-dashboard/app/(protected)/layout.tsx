"use client"

import React from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app/app-sidebar'
import { UserProvider } from '@/hooks/use-user'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-y-auto min-w-0 max-w-full overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0">
            {children}
          </SidebarInset>
        </SidebarProvider>
      </div>
    </UserProvider>
  )
}

export default MainLayout
