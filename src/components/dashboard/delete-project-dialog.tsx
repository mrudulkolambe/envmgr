'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import type { Project } from '@/types';

interface DeleteProjectDialogProps {
	project: Project | null;
	onDeleteProject: () => void;
}

export function DeleteProjectDialog({ project, onDeleteProject }: DeleteProjectDialogProps) {
	const [open, setOpen] = useState(false);

	const handleDelete = () => {
		onDeleteProject();
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="destructive" size="sm" disabled={!project}>
					<Trash2 className="size-4 mr-2" />
					Delete Project
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Project</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "{project?.name}"? This action cannot be undone and will permanently remove the project and all its environments.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={handleDelete}>
						Delete Project
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
