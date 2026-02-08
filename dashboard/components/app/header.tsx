import React from 'react'

interface AppHeaderProps {
    title: string
    description?: string
    className?: string
    actions?: React.ReactNode
}

const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    description,
    className = '',
    actions
}) => {
    return (
        <header className={`flex items-center justify-between ${className}`}>
            <div className='flex flex-col'>
                <h1 className='text-2xl font-semibold'>{title}</h1>
                {description && (
                    <p className='text-muted-foreground'>{description}</p>
                )}
            </div>
            {actions && (
                <div className='ml-auto'>{actions}</div>
            )}
        </header>
    )
}

export default AppHeader
