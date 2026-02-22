"use client"

import React from 'react'
import { UserProvider } from '@/hooks/use-user'

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  )
}

export default ProtectedLayout
