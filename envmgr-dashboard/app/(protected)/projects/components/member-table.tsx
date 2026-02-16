"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ProjectMember, ProjectInvite } from "../service/types/member.response.types"
import { Button } from "@/components/ui/button";
import { Trash2, XCircle, Mail, Shield, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { EditMemberAccessDialog } from "./edit-access-dialog";

interface ColumnOptions {
    projectId: string;
    onActionSuccess?: () => void;
    removeMember?: (id: string) => void;
    cancelInvite?: (id: string) => void;
    readOnly?: boolean;
}

export const getColumns = (options: ColumnOptions): ColumnDef<ProjectMember | ProjectInvite>[] => {
    const { projectId, onActionSuccess, removeMember, cancelInvite, readOnly = false } = options;

    const cols: ColumnDef<ProjectMember | ProjectInvite>[] = [
        {
            id: "user",
            header: "User",
            cell: ({ row }) => {
                const item = row.original;
                const isInvite = 'status' in item && item.status === 'PENDING';

                if (isInvite) {
                    const invite = item as ProjectInvite;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-dashed border-border">
                                <Mail size={16} />
                            </div>
                            <div>
                                <div className="font-medium text-sm">{invite.inviteEmail}</div>
                                <div className="text-xs text-muted-foreground italic leading-none">Invitation Pending</div>
                            </div>
                        </div>
                    );
                }

                const member = item as ProjectMember;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border/50">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
                                {member.user.name.slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium text-sm">{member.user.name}</div>
                            <div className="text-xs text-muted-foreground leading-none">{member.user.email}</div>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "access",
            header: "Access",
            cell: ({ row }) => {
                const access = row.original.access;
                return (
                    <div className="flex items-center gap-2">
                        <Shield size={14} className="text-muted-foreground" />
                        <span className="text-sm font-medium">{access}</span>
                    </div>
                )
            }
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }) => {
                const item = row.original;
                const isInvite = 'status' in item && item.status === 'PENDING';

                if (isInvite) {
                    return (
                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Pending
                        </Badge>
                    );
                }

                return (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Active
                    </Badge>
                );
            }
        },
        {
            accessorKey: "createdAt",
            header: "Joined/Invited",
            cell: ({ row }) => {
                return (
                    <div className="text-sm text-muted-foreground">
                        {new Date(row.original.createdAt).toLocaleDateString()}
                    </div>
                )
            }
        },
    ];

    if (!readOnly) {
        cols.push({
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const item = row.original;
                const isInvite = 'status' in item && item.status === 'PENDING';
                const userName = isInvite ? (item as ProjectInvite).inviteEmail : (item as ProjectMember).user.name;

                return (
                    <div className="flex gap-2">
                        <EditMemberAccessDialog
                            projectId={projectId}
                            itemId={item.id}
                            currentAccess={item.access}
                            userName={userName}
                            isInvite={isInvite}
                            onSuccess={onActionSuccess}
                        />
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => {
                                if (isInvite && cancelInvite) {
                                    cancelInvite(item.id);
                                } else if (!isInvite && removeMember) {
                                    removeMember(item.id);
                                }
                            }}
                        >
                            {isInvite ? <XCircle size={16} /> : <Trash2 size={16} />}
                        </Button>
                    </div>
                );
            }
        });
    }

    return cols;
};
