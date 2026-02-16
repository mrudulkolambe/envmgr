"use client"

import AppBreadcrumb from "@/components/app/breadcrumb"
import { VariableService } from "./service/variables.service"
import { DataTable } from "@/components/app/data-table";
import { columns } from "./components/table";
import { useEffect, useState, Suspense } from "react";
import { Variable } from "./service/types/variable.response.types";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/app/header";

import { ServiceTable } from "@/components/app/service-table";

const VariablesPageContent = () => {
    const variableService = new VariableService();
    const searchParams = useSearchParams();
    const environmentId = searchParams.get("environmentId") || "";
    const projectId = searchParams.get("projectId") || "";

    return (
        <section className="flex flex-col flex-1">
            <AppBreadcrumb />
            <div className="pt-6 animate-in fade-in duration-300">
                <PageHeader
                    title="Variables"
                    description="Manage your variables"
                />
                <ServiceTable
                    className="mt-0"
                    columns={columns}
                    fetcher={(params, callbacks) => variableService.getPaginatedVariables({ ...params, environmentId: environmentId || undefined, projectId: projectId || undefined }, callbacks)}
                    dependencies={[environmentId, projectId]}
                    searchPlaceholder="Search variables..."
                />
            </div>
        </section>
    )
}

const VariablesPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VariablesPageContent />
        </Suspense>
    )
}

export default VariablesPage
