"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Variable } from "../service/types/variable.response.types"
import NavChip from "@/components/app/navchip";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { useState } from "react";
const ValueCell = ({ value }: { value: string }) => {
    const [isVisible, setIsVisible] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(value);
    };


    return (
        <div className="flex items-center gap-2">
            <code className="px-2 py-0.5 rounded bg-muted font-mono text-xs">
                {isVisible ? value : "••••••••••••"}
            </code>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsVisible(!isVisible)}
            >
                {isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={copyToClipboard}
            >
                <Copy size={12} />
            </Button>
        </div>
    );
};

interface ColumnOptions {
  hideProject?: boolean;
  readOnly?: boolean;
}

export const getColumns = (options: ColumnOptions = {}): ColumnDef<Variable>[] => {
  const { hideProject = false, readOnly = false } = options;

  const cols: ColumnDef<Variable>[] = [
    {
      accessorKey: "name",
      header: "Key",
      cell: ({ row }) => <span className="font-mono font-medium">{row.original.name}</span>
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => <ValueCell value={row.original.value} />
    },
  ];

  if (!hideProject) {
    cols.push({
      accessorKey: "environment.project.name",
      header: "Project",
      cell: ({ row }) => {
        const project = row.original.environment?.project;
        if (!project) return <span className="text-muted-foreground italic">None</span>;
        return <NavChip label={project.name} variant="project" id={project.id} />;
      }
    });
  }

  cols.push(
    {
      accessorKey: "environment.name",
      header: "Environment",
      cell: ({ row }) => {
        const environment = row.original.environment;
        if (!environment) return <span className="text-muted-foreground italic">None</span>;
        return <NavChip label={environment.name} variant="environment" id={environment.id} />;
      }
    }
  );

  if (!readOnly) {
    cols.push(
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const variable = row.original;
          return (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => console.log("Edit", variable.id)}
              >
                <Edit size={16} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => console.log("Delete", variable.id)}
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
