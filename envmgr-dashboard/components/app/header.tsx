import React from 'react'

interface PageHeaderProps {
    title: string
    description?: string
    className?: string
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    className = ''
}) => {
    return (
        <header className={`px-5 ${className}`}>
            <h1 className='text-2xl font-semibold'>{title}</h1>
            {description && (
                <p className='text-muted-foreground'>{description}</p>
            )}
        </header>
    )
}

export default PageHeader
