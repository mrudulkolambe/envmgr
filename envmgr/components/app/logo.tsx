import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const Logo = ({ className, iconOnly = false, size = 'md', ...props }: LogoProps) => {
  const sizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  }

  const textSize = sizes[size]

  return (
    <div className={cn("flex items-center select-none", className)} {...props}>
      <div 
        className={cn(
          "font-bold tracking-widest text-[#2ecc71] uppercase leading-none", 
          textSize
        )}
        style={{
          fontFamily: 'var(--font-pixelify), monospace',
          textShadow: `
            -1px 1px 0px #111,
            -2px 2px 0px #2ecc71,
            -3px 3px 0px #111,
            -4px 4px 0px #2ecc71
          `,
          WebkitTextStroke: "1px #2ecc71",
        }}
      >
        {iconOnly ? 'E' : 'ENVMGR'}
      </div>
    </div>
  )
}

