"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface RouteItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
}

interface AppSidebarProps {
  routes?: RouteItem[];
  label?: string;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
}

const AppSidebar = ({ 
  routes = [], 
  label = "Menu", 
  headerContent, 
  footerContent 
}: AppSidebarProps) => {
  const pathname = usePathname();

  return (
    <ShadcnSidebar collapsible="offcanvas" variant='sidebar'>
      <SidebarHeader>
        {headerContent || (
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold">E</span>
            </div>
            <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
              <span className="font-semibold">envmgr</span>
              <span className="text-xs text-muted-foreground">v1.0.0</span>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className='px-2'>
        <SidebarGroup>
          <SidebarGroupLabel>{label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((item) => {
                const isActive = item.url === '/' 
                  ? pathname === '/' 
                  : pathname.startsWith(item.url);
                  
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4">
        {footerContent}
      </SidebarFooter>
      <SidebarRail />
    </ShadcnSidebar>
  );
};

export default AppSidebar;