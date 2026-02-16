"use client"

import AppBreadcrumb from "@/components/app/breadcrumb"
import { EnvironmentService } from "./service/environments.service"
import { DataTable } from "@/components/app/data-table";
import { columns } from "./components/table";
import { useEffect, useState, Suspense } from "react";
import { Environment } from "./service/types/environment.response.types";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/app/header";

import { ServiceTable } from "@/components/app/service-table";

const EnvironmentsPageContent = () => {
    const environmentService = new EnvironmentService();
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId") || "";

    return (
        <section className="flex flex-col flex-1">
            <AppBreadcrumb />
            <div className="pt-6 animate-in fade-in duration-300">
                <PageHeader
                    title="Environments"
                    description="Manage your environments"
                />
                <ServiceTable
                    className="mt-0"
                    columns={columns}
                    fetcher={(params, callbacks) => environmentService.getPaginatedEnvironments({ ...params, projectId: projectId || undefined }, callbacks)}
                    dependencies={[projectId]}
                    searchPlaceholder="Search environments..."
                />
            </div>
        </section>
    )
}

const EnvironmentsPage = () => {
    return (
        <Suspense fallback={null}>
            <EnvironmentsPageContent />
        </Suspense>
    )
}

export default EnvironmentsPage