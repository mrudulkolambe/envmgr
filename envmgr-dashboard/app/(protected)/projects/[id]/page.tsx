"use client"

import { useEffect, useState, use } from "react";
import { ProjectService } from "../service/projects.service";
import { Project } from "../service/types/project.response.types";
import AppBreadcrumb from "@/components/app/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    User,
    Boxes,
    Users,
    Github,
    Variable as VariableIcon,
    LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import NavChip from "@/components/app/navchip";
import PageHeader from "@/components/app/header";
import { ServiceTable } from "@/components/app/service-table";
import { EnvironmentService } from "../../environments/service/environments.service";
import { VariableService } from "../../variables/service/variables.service";
import { ProjectMemberService } from "../service/members.service";
import { getColumns as getEnvColumns } from "../../environments/components/table";
import { getColumns as getVarColumns } from "../../variables/components/table";
import { getColumns as getMemberColumns } from "../components/member-table";
import { InviteMemberDialog } from "../components/invite-member-dialog";
import { cn } from "@/lib/utils";

interface ProjectDetailsPageProps {
    params: Promise<{ id: string }>;
}

const ProjectDetailsPage = ({ params }: ProjectDetailsPageProps) => {
    const { id } = use(params);
    const projectService = new ProjectService();
    const environmentService = new EnvironmentService();
    const variableService = new VariableService();
    const memberService = new ProjectMemberService();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [membersRefreshKey, setMembersRefreshKey] = useState(0);

    const isReadOnly = project?.currentUserAccess === "VIEW";

    const envColumns = getEnvColumns({ hideProject: true, readOnly: isReadOnly });
    const varColumns = getVarColumns({ hideProject: true, readOnly: isReadOnly });
    const memberColumns = getMemberColumns({ 
        projectId: id,
        readOnly: isReadOnly,
        onActionSuccess: () => setMembersRefreshKey(prev => prev + 1),
        removeMember: (memberId) => {
            memberService.removeMember(id, memberId, {
                onLoading: () => {},
                onSuccess: () => setMembersRefreshKey(prev => prev + 1),
                onError: (msg) => console.error(msg)
            });
        },
        cancelInvite: (inviteId) => {
            memberService.cancelInvite(id, inviteId, {
                onLoading: () => {},
                onSuccess: () => setMembersRefreshKey(prev => prev + 1),
                onError: (msg) => console.error(msg)
            });
        }
    });

    useEffect(() => {
        if (!id) return;

        projectService.getProjectById(id, {
            onLoading: setLoading,
            onSuccess: (data) => {
                setProject(data);
                setError(null);
            },
            onError: (message) => {
                setError(message);
            }
        });
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col flex-1 p-6 space-y-6">
                <Skeleton className="h-4 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-64 md:col-span-2 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="flex flex-col flex-1 p-6 items-center justify-center text-muted-foreground">
                <p>{error || "Project not found"}</p>
                <Link href="/projects" className="mt-4 hover:underline">Back to Projects</Link>
            </div>
        );
    }

    const tabs = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "environments", label: "Environments", icon: Boxes },
        { id: "variables", label: "Variables", icon: VariableIcon },
        { id: "members", label: "Members", icon: Users },
    ];

    return (
        <section className="flex flex-col flex-1">
            <AppBreadcrumb dynamicParams={{ [id]: project.name }} />

            <div className="py-6 space-y-6 animate-in fade-in duration-500">
                <PageHeader
                    title={project.name}
                    description={project.description}
                />

                <div className="px-5">
                    {/* Tabs Header */}
                    <div className="flex items-center gap-1 border-b border-border mb-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative",
                                    activeTab === tab.id
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1 duration-300" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {activeTab === "overview" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Info */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <Card className="border-border/40 hover:border-primary/20 transition-all duration-300">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm flex items-center gap-2 font-medium text-muted-foreground">
                                                    <Boxes size={16} className="text-primary/70" /> Environments
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{project._count?.environments || 0}</div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-border/40 hover:border-primary/20 transition-all duration-300">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm flex items-center gap-2 font-medium text-muted-foreground">
                                                    <Users size={16} className="text-primary/70" /> Members
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{project._count?.members || 0}</div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-border/40 hover:border-primary/20 transition-all duration-300">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm flex items-center gap-2 font-medium text-muted-foreground">
                                                    <VariableIcon size={16} className="text-primary/70" /> Variables
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">--</div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="p-6 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-center space-y-2 bg-muted/5 min-h-[200px]">
                                        <LayoutDashboard className="size-10 text-muted-foreground/20" />
                                        <div className="text-sm font-medium text-muted-foreground">Project activity and insights will appear here soon.</div>
                                    </div>
                                </div>

                                {/* Meta Sidebar */}
                                <div className="space-y-6">
                                    <Card className="border-border/50 bg-muted/10">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Details</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {project.repo && (
                                                <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                                                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                        <Github size={20} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm text-muted-foreground font-medium">Repository</div>
                                                        <div className="font-semibold truncate">{project.repo.owner}/{project.repo.name}</div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground font-medium">Owner</div>
                                                    <div className="font-semibold">{project.owner?.name || "Unknown"}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground font-medium">Created On</div>
                                                    <div className="font-semibold">{new Date(project.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-border/50 space-y-3">
                                                <div className="text-sm font-semibold text-muted-foreground">ID</div>
                                                <code className="block p-2 rounded bg-muted font-mono text-[10px] break-all border border-border/50">
                                                    {project.id}
                                                </code>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {activeTab === "environments" && (
                            <ServiceTable
                                className="mt-0 px-0"
                                fetcher={(params, callbacks) => environmentService.getPaginatedEnvironments({ ...params, projectId: id }, callbacks)}
                                columns={envColumns}
                                dependencies={[id]}
                                searchPlaceholder="Search environments..."
                            />
                        )}

                        {activeTab === "variables" && (
                            <ServiceTable
                                className="mt-0 px-0"
                                fetcher={(params, callbacks) => variableService.getPaginatedVariables({ ...params, projectId: id }, callbacks)}
                                columns={varColumns}
                                dependencies={[id]}
                                searchPlaceholder="Search variables..."
                            />
                        )}

                        {activeTab === "members" && (
                            <div className="space-y-4">
                                <ServiceTable
                                    className="mt-0 px-0"
                                    fetcher={(params, callbacks) => memberService.getPaginatedMembers(id, params, callbacks)}
                                    columns={memberColumns}
                                    dependencies={[id, membersRefreshKey]}
                                    searchPlaceholder="Search members..."
                                    button={!isReadOnly && (
                                        <InviteMemberDialog
                                            projectId={id}
                                            onInviteSuccess={() => setMembersRefreshKey(prev => prev + 1)}
                                        />
                                    )}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProjectDetailsPage;
