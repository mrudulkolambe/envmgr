"use client"

import React, { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { SidebarTrigger } from '../ui/sidebar'
import { Separator } from '../ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb'
import { cn } from '@/lib/utils'
import { LucideIcon, Moon, Sun } from 'lucide-react'
import Button from '../app/button'
import { Avatar, AvatarFallback } from '../ui/avatar'
import ProfileDropdown from './profile-dropdown'
import { UserData } from '@/app/(auth)/login/service/types/login.response.types'

interface BreadcrumbAction {
    hasAccess: boolean
    label: string
    onClick: () => void
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    icon?: LucideIcon
}

interface BreadcrumbCustomization {
    [path: string]: string | ((segment: string) => string)
}

interface DynamicRouteParams {
    [key: string]: string
}

interface BreadcrumbProps {
    user: UserData | null;
    pathname?: string
    customLabels?: BreadcrumbCustomization
    dynamicParams?: DynamicRouteParams
    showHome?: boolean
    hidePaths?: string[]
    maxItems?: number
    actions?: BreadcrumbAction[]
    showHeader?: boolean
}

const AppBreadcrumb: React.FC<BreadcrumbProps> = ({
    user,
    pathname,
    customLabels = {},
    dynamicParams = {},
    showHome = false,
    hidePaths = [],
    maxItems,
    actions,
    showHeader = true,
}) => {
    const routerPathname = usePathname()

    // Temporary theme state since context doesn't exist yet
    const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const currentPath =
        pathname ||
        routerPathname ||
        (typeof window !== 'undefined' ? window.location.pathname : '/')

    const defaultLabels: BreadcrumbCustomization = {
        '/': 'Home',
        '/dashboard': 'Dashboard',
    }

    const combinedLabels = { ...defaultLabels, ...customLabels }

    const formatLabel = (segment: string): string =>
        segment
            .split('-')
            .map((s) => s[0].toUpperCase() + s.slice(1))
            .join(' ')

    const isDynamic = (segment: string): boolean =>
        /^[0-9a-f-]{8,36}$/i.test(segment) ||
        /^\d+$/.test(segment) ||
        /^\[.+\]$/.test(segment)


    const breadcrumbs = useMemo(() => {
        const segments = currentPath.split('/').filter(Boolean)
        const crumbs = showHome ? [{ path: '/', label: 'Home' }] : []
        let accumulatedPath = ''

        for (const segment of segments) {
            accumulatedPath += `/${segment}`
            if (hidePaths.includes(accumulatedPath)) continue

            let label: string | undefined
            const custom = combinedLabels[accumulatedPath]

            if (custom) {
                label = typeof custom === 'function' ? custom(segment) : custom
            } else if (dynamicParams[segment]) {
                label = dynamicParams[segment]
            } else if (isDynamic(segment)) {
                const paramKey = Object.keys(dynamicParams).find((key) =>
                    segment.includes(key)
                )
                label = paramKey ? dynamicParams[paramKey] : segment.substring(0, 6) + '...'
            } else {
                label = formatLabel(segment)
            }

            if (label) {
                crumbs.push({
                    path: accumulatedPath,
                    label
                })
            }
        }

        if (maxItems && crumbs.length > maxItems) {
            return [
                crumbs[0],
                { path: '#', label: '...' },
                ...crumbs.slice(-1 * (maxItems - 2)),
            ]
        }

        return crumbs
    }, [currentPath, combinedLabels, dynamicParams, hidePaths, maxItems, showHome,])

    const getUserInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header
            className={cn(
                'sticky top-0 z-40 flex flex-col w-full items-center bg-background transition-all'
            )}
        >
            <div className="w-full flex items-center justify-between h-16 px-5 border-b">
                <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mr-2 h-4" />

                    <Breadcrumb>
                        <BreadcrumbList className="font-medium">
                            {breadcrumbs.map((crumb, i) => {
                                const isLast = i === breadcrumbs.length - 1
                                const isEllipsis = crumb.label === '...'

                                return (
                                    <React.Fragment key={crumb.path + i}>
                                        <BreadcrumbItem>
                                            {isLast || isEllipsis ? (
                                                <BreadcrumbPage className={cn('text-primary')}>
                                                    {crumb.label}
                                                </BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink href={crumb.path}>
                                                    {crumb.label}
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                        {!isLast && <BreadcrumbSeparator />}
                                    </React.Fragment>
                                )
                            })}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant='ghost'
                        size='icon'
                        className='size-9'
                        onClick={() => toggleTheme()}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </Button>
                    <ProfileDropdown
                        user={user}
                        trigger={
                            <Button variant='ghost' className='size-10 p-0 rounded-full'>
                                <Avatar className='size-9'>
                                    <AvatarFallback className="bg-primary text-primary-foreground font-medium text-xs">
                                        {user?.name ? getUserInitials(user.name) : 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        }
                    />
                </div>
            </div>
        </header>
    )
}

export default AppBreadcrumb
