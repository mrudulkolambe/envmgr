import React from 'react'
import { ButtonMain, buttonVariants } from '../ui/button'
import { Loader } from 'lucide-react'

const Button = ({ children, loading, variant, size, disabled, ...props }: React.ComponentProps<typeof ButtonMain>) => {
    return (
        <ButtonMain {...props} variant={variant} size={size} loading={loading} disabled={disabled}>
            {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : children}
        </ButtonMain>
    )
}

export default Button
export { buttonVariants }