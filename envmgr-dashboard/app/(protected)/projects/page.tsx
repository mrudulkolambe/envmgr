"use client"

import AppBreadcrumb from "@/components/app/breadcrumb"
import { ProjectService } from "./service/projects.service"
import { DataTable } from "@/components/app/data-table";
import { columns } from "./components/table";
import { useEffect, useState } from "react";
import { Project } from "./service/types/project.response.types";
import PageHeader from "@/components/app/header";

import { ServiceTable } from "@/components/app/service-table";

const ProjectsPage = () => {
    const projectService = new ProjectService();

    return (
        <section className="flex flex-col flex-1">
            <AppBreadcrumb />
            <div className="pt-6 animate-in fade-in duration-300">
                <PageHeader
                    title="Projects"
                    description="Manage your projects"
                />
                <ServiceTable
                    className="mt-0"
                    columns={columns}
                    fetcher={(params, callbacks) => projectService.getPaginatedProjects(params, callbacks)}
                    searchPlaceholder="Search projects..."
                />
            </div>
        </section>
    )
}

export default ProjectsPage