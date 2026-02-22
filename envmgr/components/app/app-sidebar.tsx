"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/app/logo"
import {
  LayoutDashboard,
  FolderTree,
  Boxes,
  Code2,
  Settings,
  ShieldCheck,
  History,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  url: string
  icon?: React.ElementType
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const data: { navMain: NavGroup[] } = {
  navMain: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Resources",
      items: [
        {
          title: "Environments",
          url: "/environments",
          icon: Boxes,
        },
        {
          title: "Variables",
          url: "/variables",
          icon: Code2,
        },
      ],
    },

    {
      title: "Team & Security",
      items: [
        {
          title: "Members",
          url: "/members",
          icon: Users,
        },
        {
          title: "Audit Logs",
          url: "/audit-logs",
          icon: History,
        },
        {
          title: "Roles",
          url: "/roles",
          icon: ShieldCheck,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "General",
          url: "/settings",
          icon: Settings,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props} variant="inset">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border/50">
        <Link href="/dashboard">
          <Logo size="sm" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-0">
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url || pathname.startsWith(item.url + "/")

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="transition-all duration-200 hover:bg-sidebar-accent/50 active:scale-[0.98]"
                      >
                        <Link 
                          href={item.url} 
                          className={cn(
                            "flex items-center gap-3 px-4 py-2 w-full transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground group-hover/menu-item:text-foreground"
                          )}
                        >
                          {item.icon && <item.icon className={cn("size-4", isActive ? "opacity-100" : "opacity-40")} />}
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
