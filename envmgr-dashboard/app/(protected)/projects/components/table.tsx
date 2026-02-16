"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Project } from "../service/types/project.response.types"
import NavChip from "@/components/app/navchip";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/projects/${row.original.id}`}
        className="font-medium text-primary hover:underline underline-offset-4"
      >
        {row.original.name}
      </Link>
    )
  },

  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description;
      if (!description) return <span className="text-muted-foreground italic">None</span>;
      return <div className="text-sm text-muted-foreground">{description}</div>;
    }
  },
  {
    accessorKey: "repo",
    header: "Repository",
    cell: ({ row }) => {
      const repo = row.original.repo;
      if (!repo) return <span className="text-muted-foreground italic">None</span>;
      return (
        <div className="flex flex-col gap-1">
          <div className="font-medium">
            {repo.owner}/{repo.name}
          </div>
          <div className="text-xs text-muted-foreground uppercase">
            {repo.provider}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "environments",
    header: "Environments",
    cell: ({ row }) => {
      const count = row.original._count?.environments || 0;
      return <NavChip label={`${count} Environments`} variant="environment" id={row.original.id} />;
    }
  },
  {
    accessorKey: "members",
    header: "Members",
    cell: ({ row }) => {
      const count = row.original._count?.members || 0;
      return <NavChip label={`${count} Members`} variant="project" id={row.original.id} />;
    }
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => console.log("Manage Members", project.id)}
          >
            <UserPlus size={16} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => console.log("Edit", project.id)}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => console.log("Delete", project.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      );
    }
  }
]