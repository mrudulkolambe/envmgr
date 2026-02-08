"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Building2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export interface Organization {
  id: string
  name: string
}

export function OrgSwitcher({
  organizations,
  defaultOrgId,
  onOrgChange,
}: {
  organizations: Organization[]
  defaultOrgId: string
  onOrgChange?: (id: string) => void
}) {
  const [selectedOrgId, setSelectedOrgId] = React.useState(defaultOrgId)
  
  const selectedOrg = React.useMemo(() => 
    organizations.find(org => org.id === selectedOrgId) || organizations[0],
    [organizations, selectedOrgId]
  )

  const handleSelect = (id: string) => {
    setSelectedOrgId(id)
    onOrgChange?.(id)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Building2 className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Organization</span>
                <span className="text-xs text-muted-foreground">{selectedOrg?.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width)"
            align="start"
            side="top"
          >
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onSelect={() => handleSelect(org.id)}
              >
                {org.name}
                {org.id === selectedOrgId && <Check className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
