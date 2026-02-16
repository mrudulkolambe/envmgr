"use client"

import React, { useEffect, useState, use } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Boxes, UserPlus, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import API from "@/lib/api";
import { useRouter } from "next/navigation";

interface InvitePageProps {
    params: Promise<{ token: string }>;
}

const InvitePage = ({ params }: InvitePageProps) => {
    const { token } = use(params);
    const router = useRouter();
    const [invite, setInvite] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchInvite();
    }, [token]);

    const fetchInvite = async () => {
        setLoading(true);
        const res = await API.get<any>(`/invites/${token}`);
        if (res.success) {
            setInvite(res.data);
            setError(null);
        } else {
            setError(res.message || "Failed to load invitation");
        }
        setLoading(false);
    };

    const handleAccept = async () => {
        setAccepting(true);
        const res = await API.post<any>(`/invites/${token}/accept`, {});
        if (res.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push(`/projects/${invite.projectId}`);
            }, 2000);
        } else {
            if (res.status === 401) {
                // Redirect to signup with return URL
                router.push(`/auth/signup?callbackUrl=/invites/${token}`);
            } else {
                setError(res.message || "Failed to accept invitation");
            }
        }
        setAccepting(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-center mb-8">
                    <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                        <Boxes size={28} />
                    </div>
                </div>

                <Card className="border-border/50 shadow-xl shadow-secondary/40 overflow-hidden">
                    {success ? (
                        <div className="p-8 text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                    <CheckCircle2 size={40} />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold">Invitation Accepted!</CardTitle>
                            <CardDescription>
                                You are now a member of <strong>{invite.project.name}</strong>.
                                Redirecting you to the project dashboard...
                            </CardDescription>
                        </div>
                    ) : (
                        <>
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-2xl font-bold">Project Invitation</CardTitle>
                                <CardDescription>
                                    You have been invited to collaborate
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-4">
                                {error ? (
                                    <div className="p-4 rounded-lg bg-destructive/10 text-destructive flex gap-3 items-start border border-destructive/20">
                                        <XCircle className="shrink-0 mt-0.5" size={18} />
                                        <p className="text-sm font-medium">{error}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                                            <div>
                                                <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Project</div>
                                                <div className="text-lg font-bold text-foreground">{invite.project.name}</div>
                                                {invite.project.description && (
                                                    <div className="text-sm text-slate-500 mt-1 line-clamp-2">{invite.project.description}</div>
                                                )}
                                            </div>
                                            
                                            <div className="pt-3 border-t border-primary/10">
                                                <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Invited By</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary italic">
                                                        {invite.invitedBy.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="text-sm font-medium">{invite.invitedBy.name}</div>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-primary/10">
                                                <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Your Access</div>
                                                <div className="text-sm font-bold bg-primary/10 text-primary px-2 py-0.5 rounded inline-block">
                                                    {invite.access}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="flex flex-col gap-3 pt-2">
                                {!error && (
                                    <Button 
                                        className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20"
                                        onClick={handleAccept}
                                        disabled={accepting}
                                    >
                                        {accepting ? <Loader2 className="animate-spin mr-2" size={20} /> : <UserPlus className="mr-2" size={20} />}
                                        Accept Invitation
                                    </Button>
                                )}
                                <Button variant="ghost" asChild className="w-full text-slate-500">
                                    <Link href="/projects">
                                        Go to Dashboard
                                    </Link>
                                </Button>
                            </CardFooter>
                        </>
                    )}
                </Card>
                
                <p className="text-center text-slate-400 text-xs mt-8 italic">
                    By accepting, you agree to the project's collaboration terms.
                </p>
            </div>
        </div>
    );
};

export default InvitePage;
