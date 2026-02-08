'use client';

import React, { useState, useEffect } from 'react';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Eye, EyeOff, Loader, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export type ValidatorFunction = (value: string) => string | null;

export interface FormFieldProps<T extends Record<string, any> = any> {
    id: string;
    label: string;
    name?: keyof T;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'file';
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    loading?: boolean;
    monospace?: boolean;
    validator?: ValidatorFunction;
    form?: {
        values: T;
        errors: Partial<Record<keyof T, string>>;
        touched: Partial<Record<keyof T, boolean>>;
        isSubmitting: boolean;
        handleChange: <K extends keyof T>(field: K) => (value: string) => void;
        handleBlur: <K extends keyof T>(field: K) => () => void;
    };
    value?: string;
    onChange?: (value: string, isValid: boolean) => void;
    onBlur?: () => void;
    className?: string;
    labelExtra?: React.ReactNode;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
}

export function FormField<T extends Record<string, any>>({
    id,
    label,
    name,
    type = 'text',
    placeholder,
    required = false,
    disabled = false,
    readOnly = false,
    loading = false,
    monospace = false,
    validator,
    form,
    value: propValue = '',
    onChange,
    onBlur,
    className,
    labelExtra,
    validateOnChange = true,
    validateOnBlur = true,
}: FormFieldProps<T>) {
    const [localValue, setLocalValue] = useState(propValue);
    const [localError, setLocalError] = useState<string>('');
    const [localTouched, setLocalTouched] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (propValue !== undefined) {
            setLocalValue(propValue);
        }
    }, [propValue]);

    const isControlledByForm = !!(form && name);
    const currentValue = isControlledByForm ? String((form.values as any)[name] || '') : localValue;

    let displayError = '';
    const nameStr = name as string;
    if (isControlledByForm) {
        if ((form.errors as any)[nameStr] && (form.touched as any)[nameStr]) {
            displayError = (form.errors as any)[nameStr]!;
        }
    } else if (localTouched && localError) {
        displayError = localError;
    }

    const validate = (val: string) => {
        if (!validator) return true;
        const errorMessage = validator(val);
        setLocalError(errorMessage || '');
        return errorMessage === null;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        let isValid = true;
        if (!isControlledByForm) {
            setLocalValue(newValue);
            if (validateOnChange && localTouched) {
                isValid = validate(newValue);
            }
        } else {
            form.handleChange(name!)(newValue);
            if (validator) {
                isValid = validate(newValue);
            }
        }

        onChange?.(newValue, isValid);
    };

    const handleInputBlur = () => {
        setLocalTouched(true);
        if (validateOnBlur) {
            validate(currentValue);
        }

        if (isControlledByForm) {
            form.handleBlur(name!)();
        }

        onBlur?.();
    };

    const inputType = type === 'password' && showPassword ? 'text' : (type === 'search' ? 'text' : type);

    const hasError = !!displayError;

    return (
        <Field className={className}>
            <div className="flex items-center">
                <FieldLabel htmlFor={id}>{label}</FieldLabel>
                {labelExtra}
            </div>
            <div className="relative">
                {type === 'search' && (
                    <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10">
                        <Search className="h-4 w-4" />
                    </div>
                )}

                <Input
                    id={id}
                    type={inputType}
                    placeholder={`${placeholder || ''}${required ? "*" : ""}`}
                    required={required}
                    value={currentValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    disabled={disabled || (isControlledByForm && form.isSubmitting)}
                    readOnly={readOnly}
                    aria-invalid={hasError}
                    className={cn(
                        type === 'password' && "pr-10",
                        type === 'search' && "pl-10",
                        hasError && "border-error! focus-visible:border-error! focus-visible:ring-error/50",
                        monospace && "font-mono!",
                        loading && "pr-10"
                    )}
                />

                {type === 'password' && !loading && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                )}

                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Loader className="h-4 w-4 animate-spin" />
                    </div>
                )}
            </div>
            {hasError && (
                <FieldError className='text-xs'>{displayError}</FieldError>
            )}
        </Field>
    );
}
