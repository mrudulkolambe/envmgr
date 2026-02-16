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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Shield, Edit2 } from "lucide-react";
import { ProjectMemberService } from "../service/members.service";

interface EditMemberAccessDialogProps {
    projectId: string;
    itemId: string;
    currentAccess: 'VIEW' | 'EDIT';
    userName: string;
    isInvite: boolean;
    onSuccess?: () => void;
}

const EditMemberAccessDialog = ({ 
    projectId, 
    itemId, 
    currentAccess, 
    userName, 
    isInvite, 
    onSuccess 
}: EditMemberAccessDialogProps) => {
    const [open, setOpen] = useState(false);
    const [access, setAccess] = useState<'VIEW' | 'EDIT'>(currentAccess);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const memberService = new ProjectMemberService();

    const handleUpdate = () => {
        const serviceCallbacks = {
            onLoading: setLoading,
            onSuccess: () => {
                setOpen(false);
                setError(null);
                if (onSuccess) onSuccess();
            },
            onError: (msg: string) => {
                setError(msg);
            }
        };

        if (isInvite) {
            memberService.updateInviteAccess(projectId, itemId, access, serviceCallbacks);
        } else {
            memberService.updateMemberAccess(projectId, itemId, access, serviceCallbacks);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                    <Edit2 size={14} />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Access</DialogTitle>
                    <DialogDescription>
                        Update access level for <strong>{userName}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2 w-full">
                        <Label htmlFor="edit-access">Access Level</Label>
                        <Select value={access} onValueChange={(v: any) => setAccess(v)}>
                            <SelectTrigger id="edit-access" className='w-full'>
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
                    <Button onClick={handleUpdate} disabled={loading || access === currentAccess}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Access
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export { EditMemberAccessDialog };
