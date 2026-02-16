import { Code2, Boxes, FolderTree, LucideIcon, User2 } from "lucide-react";
import Link from "next/link";

interface NavChipProps {
    label: string;
    variant: "project" | "environment" | "variable" | "badge";
    id?: string;
    icon?: LucideIcon;
}


const   NavChip = ({ label, variant, id, icon }: NavChipProps) => {
    const config = {
        project: {
            icon: FolderTree,
            path: "/projects"
        },
        environment: {
            icon: Boxes,
            path: "/environments"
        },
        variable: {
            icon: Code2,
            path: "/variables"
        },
        badge: {
            icon: icon,
            path: null
        }
    }

    const Icon = config[variant].icon;

    const chipContent = (
        <>
            {Icon && <Icon size={14} />}
            {label}
        </>
    );

    const chipClassName = "text-muted-foreground font-medium px-3 py-1 bg-white/5 w-max rounded-full flex items-center gap-1 cursor-pointer hover:bg-white/10 duration-200";

    if (variant === "badge") {
        return (
            <div className={chipClassName}>
                {chipContent}
            </div>
        );
    }

    const getHref = () => {
        if (variant === "environment") return `${config[variant].path}?projectId=${id}`;
        if (variant === "variable") return `${config[variant].path}?environmentId=${id}`;
        return `${config[variant].path}/${id}`;
    };

    return (
        <Link 
            href={getHref()} 
            className={chipClassName}
        >
            {chipContent}
        </Link>
    )


}

export default NavChip