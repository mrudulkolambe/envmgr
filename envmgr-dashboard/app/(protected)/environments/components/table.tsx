"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Environment } from "../service/types/environment.response.types"
import NavChip from "@/components/app/navchip";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ColumnOptions {
  hideProject?: boolean;
  readOnly?: boolean;
}

export const getColumns = (options: ColumnOptions = {}): ColumnDef<Environment>[] => {
  const { hideProject = false, readOnly = false } = options;

  const cols: ColumnDef<Environment>[] = [
    {
      accessorKey: "name",
      header: "Name",
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
  ];

  if (!hideProject) {
    cols.push({
      accessorKey: "project.name",
      header: "Project",
      cell: ({ row }) => {
        const project = row.original.project;
        if (!project) return <span className="text-muted-foreground italic">None</span>;
        return <NavChip label={project.name} variant="project" id={project.id} />;
      }
    });
  }

  cols.push(
    {
      accessorKey: "variables",
      header: "Variables",
      cell: ({ row }) => {
        const count = row.original._count?.variables || 0;
        return <NavChip label={`${count} Variables`} variant="variable" id={row.original.id} />;
      }
    }
  );

  if (!readOnly) {
    cols.push(
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const environment = row.original;
          return (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => console.log("Edit", environment.id)}
              >
                <Edit size={16} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => console.log("Delete", environment.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          );
        }
      }
    );
  }

  return cols;
};

// For backward compatibility
export const columns = getColumns();
