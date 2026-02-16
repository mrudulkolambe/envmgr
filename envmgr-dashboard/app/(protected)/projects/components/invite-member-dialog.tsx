"use client"

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import { ProjectMemberService } from "../service/members.service";

interface InviteMemberDialogProps {
    projectId: string;
    onInviteSuccess?: () => void;
}

const InviteMemberDialog = ({ projectId, onInviteSuccess }: InviteMemberDialogProps) => {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [access, setAccess] = useState<'VIEW' | 'EDIT'>('VIEW');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const memberService = new ProjectMemberService();

    const handleInvite = () => {
        if (!email) {
            setError("Email is required");
            return;
        }

        memberService.inviteMember(
            projectId,
            { email, access },
            {
                onLoading: setLoading,
                onSuccess: () => {
                    setOpen(false);
                    setEmail("");
                    setAccess("VIEW");
                    setError(null);
                    if (onInviteSuccess) onInviteSuccess();
                },
                onError: (msg) => {
                    setError(msg);
                }
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <UserPlus size={16} /> Invite Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Member</DialogTitle>
                    <DialogDescription>
                        Send an invitation to join this project. They will receive an email to accept the invite.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2 w-full">
                        <Label htmlFor="access">Access Level</Label>
                        <Select value={access} onValueChange={(v: any) => setAccess(v)}>
                            <SelectTrigger id="access" className='w-full'>
                                <SelectValue placeholder="Select access level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="VIEW">View Only</SelectItem>
                                <SelectItem value="EDIT">Full Edit Access</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {error && (
                        <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">{error}</p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleInvite} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Invitation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export { InviteMemberDialog };
