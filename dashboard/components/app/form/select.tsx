'use client';

import React, { useEffect, useState } from 'react';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface FormSelectFieldProps<T extends Record<string, any>> {
    id: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    form: {
        values: T;
        errors: Partial<Record<keyof T, string>>;
        touched: Partial<Record<keyof T, boolean>>;
        isSubmitting: boolean;
        handleChange: <K extends keyof T>(field: K) => (value: string) => void;
        handleBlur: <K extends keyof T>(field: K) => () => void;
    };
    name: keyof T;
    className?: string;
    labelExtra?: React.ReactNode;
    options?: Array<{ label: string; value: string }>;
    fetchOptions?: () => Promise<Array<{ label: string; value: string }> | null>;
    onChange?: (value: string) => void;
    loading?: boolean;
}

export function FormSelectField<T extends Record<string, any>>({
    id,
    label,
    placeholder = 'Select an option',
    required = false,
    disabled = false,
    form,
    name,
    className,
    labelExtra,
    options: staticOptions,
    fetchOptions,
    onChange,
    loading = false,
}: FormSelectFieldProps<T>) {
    const [options, setOptions] = useState<Array<{ label: string; value: string }>>(staticOptions || []);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const hasError = form.errors[name] && form.touched[name];

    useEffect(() => {
        if (staticOptions) {
            setOptions(staticOptions);
        }
    }, [staticOptions]);

    const handleOpenChange = (open: boolean) => {
        if (open && fetchOptions && !hasFetched && !isLoading) {
            setIsLoading(true);
            setHasFetched(true);
            fetchOptions()
                .then((fetchedOptions) => {
                    if (fetchedOptions) {
                        setOptions(fetchedOptions);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching options:', error);
                    setHasFetched(false);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    return (
        <Field className={className}>
            <div className="flex items-center justify-between">
                <FieldLabel htmlFor={id}>{label}</FieldLabel>
                <div className="flex items-center gap-2">
                    {loading && (
                        <svg className="animate-spin h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {labelExtra}
                </div>
            </div>
            <Select
                value={String(form.values[name] || '')}
                onValueChange={(value) => {
                    form.handleChange(name)(value);
                    form.handleBlur(name)();
                    onChange?.(value);
                }}
                onOpenChange={(open) => {
                    handleOpenChange(open);
                    if (open) {
                        form.handleBlur(name)();
                    }
                }}
                disabled={disabled || form.isSubmitting}
            >
                <SelectTrigger
                    size='default'
                    id={id}
                    className={cn(
                        'w-full h-11',
                        hasError && 'border-destructive focus-visible:ring-destructive'
                    )}
                    aria-invalid={hasError}
                >
                    <SelectValue placeholder={isLoading ? 'Loading...' : placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {isLoading ? (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                            Loading options...
                        </div>
                    ) : options.length > 0 ? (
                        options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))
                    ) : (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                            No options available
                        </div>
                    )}
                </SelectContent>
            </Select>
            {hasError && (
                <FieldError className='text-xs'>{form.errors[name]}</FieldError>
            )}
        </Field>
    );
}
