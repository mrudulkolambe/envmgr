"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar, { RouteItem } from "@/components/app/sidebar";
import { 
  LayoutDashboard, 
  Layers, 
  Settings, 
  Users,
  Key,
  Database,
  User,
  LogOut,
  CreditCard,
  Bell
} from "lucide-react";
import AppBreadcrumb from "@/components/app/breadcrumb";
import { UserData } from '@/app/(auth)/login/service/types/login.response.types';
import { useRouter } from 'next/navigation';
import { authService } from '@/service/auth.service';
import { OrgSwitcher } from '@/components/app/org-switcher';

const DEFAULT_ROUTES: RouteItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Organizations",
    url: "/organizations",
    icon: Database,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: Layers,
  },
  {
    title: "Team",
    url: "/team",
    icon: Users,
  },
  {
    title: "API Keys",
    url: "/api-keys",
    icon: Key,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserData | null>(null);
  // const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const router = useRouter();

  // useEffect(() => {
  //   const init = async () => {
  //     const userRes = await authService.me();
  //     if (userRes.success && userRes.data) {
  //       setUser(userRes.data);
  //     }

  //     await organizationService.list({
  //       onLoading: () => {},
  //       onSuccess: (data) => setOrganizations(data),
  //       onError: (message) => toast.error(message)
  //     });
  //   };
  //   init();
  // }, []);

  // const orgsForSwitcher = organizations.map(org => ({
  //   id: org._id,
  //   name: org.name
  // }));

  return (
    <SidebarProvider>
      <AppSidebar 
        routes={DEFAULT_ROUTES} 
        // footerContent={
        //   orgsForSwitcher.length > 0 && (
        //     <OrgSwitcher 
        //       organizations={orgsForSwitcher} 
        //       defaultOrgId={orgsForSwitcher[0].id} 
        //     />
        //   )
        // }
      />
      <SidebarInset>
        <AppBreadcrumb user={user} />
        <main className="flex-1 p-5">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
