import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '@/components/ui/input-group'
import { Eye, EyeOff, Search } from 'lucide-react'
import React, { useState } from 'react'
import { cn } from '@/lib/utils'

const Textarea = ({
    label,
    placeholder,
    type = "text",
    required,
    value,
    onChange,
    onBlur,
    description,
    id,
    autoComplete,
    error,
    touched,
    className,
    onPaste,
}: {
    label?: string,
    placeholder?: string,
    type?: string,
    required?: boolean,
    value?: string,
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void,
    description?: string,
    id?: string,
    autoComplete?: string,
    error?: string | null,
    touched?: boolean,
    className?: string,
    onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const showError = touched && error;

    const isPassword = type === "password";
    const isSearch = type === "search";

    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <Field className={cn('gap-2', className)} data-invalid={showError}>
            {label && <FieldLabel className='font-normal text-muted-foreground' htmlFor={id}>{label}</FieldLabel>}
            <div className="relative">
                <InputGroup className={cn("min-h-[100px]", isSearch && "has-[[data-slot=input-group-control]:focus-visible]:ring-0")}>
                    {isSearch && (
                        <InputGroupAddon align="inline-start">
                            <Search className="size-4" />
                        </InputGroupAddon>
                    )}
                    <InputGroupTextarea
                        id={id}
                        autoComplete={autoComplete}
                        placeholder={placeholder}
                        required={required}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        onPaste={onPaste}
                        aria-invalid={!!showError}
                        className="min-h-[100px] resize-y"
                    />
                    {isPassword && (
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton
                                size="icon-xs"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </InputGroupButton>
                        </InputGroupAddon>
                    )}
                </InputGroup>
            </div>
            {(description && !showError) && <FieldDescription className='font-normal text-xs text-muted-foreground'>{description}</FieldDescription>}
            {showError && <FieldError errors={[{ message: error }]} />}
        </Field>
    )
}

export default Textarea