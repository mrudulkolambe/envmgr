import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input as InputUI } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Eye, EyeOff, Search } from 'lucide-react'
import React, { useState } from 'react'
import { cn } from '@/lib/utils'

const Input = ({
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
    type?: "text" | "password" | "email" | "number" | "search" | "url" | "tel" | "date" | "datetime-local" | "month" | "week",
    required?: boolean,
    value?: string,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void,
    description?: string,
    id?: string,
    autoComplete?: string,
    error?: string | null,
    touched?: boolean,
    className?: string,
    onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const showError = touched && error;

    const isPassword = type === "password";
    const isSearch = type === "search";

    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <Field className={cn('gap-2', className)} data-invalid={showError}>
            {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
            <div className="relative">
                {isSearch || isPassword ? (
                    <InputGroup className={cn("h-11", isSearch && "has-[[data-slot=input-group-control]:focus-visible]:ring-0")}>
                        {isSearch && (
                            <InputGroupAddon align="inline-start">
                                <Search className="size-4" />
                            </InputGroupAddon>
                        )}
                        <InputGroupInput
                            id={id}
                            autoComplete={autoComplete}
                            placeholder={placeholder}
                            type={inputType}
                            required={required}
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            onPaste={onPaste}
                            aria-invalid={!!showError}
                            className="h-full"
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
                ) : (
                    <InputUI
                        id={id}
                        autoComplete={autoComplete}
                        placeholder={placeholder}
                        type={type}
                        required={required}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        onPaste={onPaste}
                        aria-invalid={!!showError}
                        className={cn(isSearch && "focus-visible:ring-0")}
                    />
                )}
            </div>
            {(description && !showError) && <FieldDescription>{description}</FieldDescription>}
            {showError && <FieldError errors={[{ message: error }]} />}
        </Field>
    )
}

export default Input