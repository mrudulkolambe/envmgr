'use client';

import { useState, useCallback, useMemo } from 'react';
import { Validator } from '../utils/form/validatorfactory';

type ValidatorFunction = (value: string) => string | null;

export interface UseValidatedFormConfig<T extends Record<string, any>> {
    initialData: T;
    validators: {
        [K in keyof T]?: Validator;
    };
}

export interface FormState<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isValid: boolean;
    isSubmitting: boolean;
}

export interface FormActions<T> {
    setValue: <K extends keyof T>(field: K, value: T[K]) => void;
    setValues: (values: Partial<T>) => void;
    setError: <K extends keyof T>(field: K, error: string) => void;
    setTouched: <K extends keyof T>(field: K, touched: boolean) => void;
    validateField: <K extends keyof T>(field: K) => boolean;
    validateAll: () => boolean;
    handleChange: <K extends keyof T>(field: K) => (value: string, isValid?: boolean) => void;
    handleBlur: <K extends keyof T>(field: K) => () => void;
    handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
    reset: () => void;
    setSubmitting: (isSubmitting: boolean) => void;
}

export function useValidatedForm<T extends Record<string, any>>({
    initialData,
    validators,
}: UseValidatedFormConfig<T>): FormState<T> & FormActions<T> {
    const [values, setValuesState] = useState<T>(initialData);
    const [errors, setErrorsState] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Build validator functions
    const validatorFunctions = Object.keys(validators).reduce((acc, key) => {
        const validator = validators[key as keyof T];
        if (validator) {
            acc[key as keyof T] = validator.build();
        }
        return acc;
    }, {} as Partial<Record<keyof T, ValidatorFunction>>);

    // Validate a single field
    const validateField = useCallback(<K extends keyof T>(field: K): boolean => {
        const validator = validatorFunctions[field];
        if (!validator) return true;

        const value = String(values[field] || '');
        const error = validator(value);

        setErrorsState(prev => ({
            ...prev,
            [field]: error || undefined,
        }));

        return error === null;
    }, [values, validatorFunctions]);

    // Validate all fields
    const validateAll = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof T, string>> = {};
        let isValid = true;

        Object.keys(validatorFunctions).forEach((key) => {
            const field = key as keyof T;
            const validator = validatorFunctions[field];
            if (validator) {
                const value = String(values[field] || '');
                const error = validator(value);
                if (error) {
                    newErrors[field] = error;
                    isValid = false;
                }
            }
        });

        setErrorsState(newErrors);
        return isValid;
    }, [values, validatorFunctions]);

    // Set a single value
    const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
        setValuesState(prev => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    // Set multiple values
    const setValues = useCallback((newValues: Partial<T>) => {
        setValuesState(prev => ({
            ...prev,
            ...newValues,
        }));
    }, []);

    // Set error for a field
    const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
        setErrorsState(prev => ({
            ...prev,
            [field]: error,
        }));
    }, []);

    // Set touched state for a field
    const setTouched = useCallback(<K extends keyof T>(field: K, isTouched: boolean) => {
        setTouchedState(prev => ({
            ...prev,
            [field]: isTouched,
        }));
    }, []);

    // Handle change event
    const handleChange = useCallback(<K extends keyof T>(field: K) => {
        return (value: string) => {
            setValue(field, value as T[K]);

            // Validate immediately with the new value
            const validator = validatorFunctions[field];
            if (validator) {
                const error = validator(value);
                setErrorsState(prev => ({
                    ...prev,
                    [field]: error || undefined,
                }));
            }
        };
    }, [setValue, validatorFunctions]);

    // Handle blur event
    const handleBlur = useCallback(<K extends keyof T>(field: K) => {
        return () => {
            setTouched(field, true);

            // Validate using current state value
            setValuesState(currentValues => {
                const validator = validatorFunctions[field];
                if (validator) {
                    const value = String(currentValues[field] || '');
                    const error = validator(value);
                    setErrorsState(prev => ({
                        ...prev,
                        [field]: error || undefined,
                    }));
                }
                return currentValues;
            });
        };
    }, [setTouched, validatorFunctions]);

    // Handle form submit
    const handleSubmit = useCallback((onSubmit: (values: T) => void | Promise<void>) => {
        return async (e?: React.FormEvent) => {
            if (e) {
                e.preventDefault();
            }

            // Mark all fields as touched
            const allTouched = Object.keys(initialData).reduce((acc, key) => {
                acc[key as keyof T] = true;
                return acc;
            }, {} as Record<keyof T, boolean>);
            setTouchedState(allTouched);

            // Validate all fields
            const isValid = validateAll();

            if (isValid) {
                setIsSubmitting(true);
                try {
                    await onSubmit(values);
                } finally {
                    setIsSubmitting(false);
                }
            }
        };
    }, [initialData, validateAll, values]);

    // Reset form
    const reset = useCallback(() => {
        setValuesState(initialData);
        setErrorsState({});
        setTouchedState({});
        setIsSubmitting(false);
    }, [initialData]);

    // Check if form is valid
    // Form is valid if:
    // 1. No errors exist
    // 2. All required fields (those with validators) have non-empty values
    const isValid = useMemo(() => {
        // Check for actual errors (filter out undefined/null values)
        const actualErrors = Object.values(errors).filter(error => error !== undefined && error !== null);
        if (actualErrors.length > 0) {
            return false;
        }

        // Check if all required fields have values
        for (const key of Object.keys(validatorFunctions)) {
            const field = key as keyof T;
            const value = values[field];

            // If field has a validator and value is empty/null/undefined, form is invalid
            if (validatorFunctions[field] && (!value || String(value).trim() === '')) {
                return false;
            }
        }

        return true;
    }, [values, errors, validatorFunctions]);

    return {
        // State
        values,
        errors,
        touched,
        isValid,
        isSubmitting,
        // Actions
        setValue,
        setValues,
        setError,
        setTouched,
        validateField,
        validateAll,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        setSubmitting: setIsSubmitting,
    };
}
