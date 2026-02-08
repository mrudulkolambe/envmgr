import { ColumnDef } from "@tanstack/react-table"
import { OrganizationListItem } from "../service/types/organization.list.response.types"

export const createColumns = (): ColumnDef<OrganizationListItem>[] => [
    {
        accessorKey: "name",
        header: "NAME",
        cell: ({ row }) => {
            const name = row.original.name;
            return (
                <div className="flex flex-col">
                    <p className="font-medium">{name}</p>
                </div>
            );
        },
    },
    {
        accessorKey: "creatorName",
        header: "CREATOR",
        cell: ({ row }) => {
            return (<p className="font-medium">{row.original.creatorName || 'N/A'}</p>);
        },
    },
    {
        accessorKey: "role",
        header: "YOUR ROLE",
        cell: ({ row }) => {
            return (<p className="font-medium capitalize">{row.original.role}</p>);
        },
    },
    {
        accessorKey: "createdAt",
        header: "CREATED AT",
        cell: ({ row }) => {
            const date = new Date(row.original.createdAt).toLocaleDateString();
            return (<p className="font-medium">{date}</p>);
        },
    }
]

