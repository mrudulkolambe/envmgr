import { FieldValidator } from '@/lib/db/validators/validator';
import { useState, useCallback, useMemo } from 'react';

type ValidationSchema = {
  [key: string]: FieldValidator;
};

type FormValues = {
  [key: string]: any;
};

type FormErrors = {
  [key: string]: string | null | undefined;
};

type TouchedFields = {
  [key: string]: boolean;
};

type SubmitHandler<T> = (values: T) => Promise<void> | void;

export interface UseFormValidatorOptions<T extends FormValues> {
  initialValues: T;
  validationSchema: ValidationSchema;
  onSubmit: SubmitHandler<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface FormField {
  id: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | any) => void;
  onBlur: () => void;
  error: string | null | undefined;
  touched: boolean;
}

export interface UseFormValidatorReturn<T extends FormValues> {
  values: T;
  errors: FormErrors;
  touched: TouchedFields;
  isSubmitting: boolean;
  isValid: boolean;
  isValidating: boolean;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | any) => void;
  handleBlur: (field: string) => () => void;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error: string | null | undefined) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  resetForm: () => void;
  validateField: (field: string) => string | null;
  validateForm: () => boolean;
  getFieldProps: (field: string) => FormField;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: Partial<FormErrors>) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

export function useFormValidator<T extends FormValues>({
  initialValues,
  validationSchema,
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormValidatorOptions<T>): UseFormValidatorReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors>({});
  const [touched, setTouchedState] = useState<TouchedFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Validate a single field
  const validateField = useCallback(
    (field: string): string | null => {
      const validator = validationSchema[field];
      if (!validator) return null;

      const value = values[field];
      return validator.validate(value, values);
    },
    [validationSchema, values]
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach((field) => {
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrorsState(newErrors);
    return isValid;
  }, [validationSchema, validateField]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(validationSchema).every((field) => {
      const error = validateField(field);
      return !error;
    });
  }, [validationSchema, validateField]);

  // Handle field change
  const handleChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | any) => {
      const value = e?.target ? e.target.value : e;
      const nextValues = { ...values, [field]: value };

      setValuesState(nextValues);

      if (validateOnChange) {
        const error = validationSchema[field]?.validate(value, nextValues);
        setErrorsState((prev) => ({ ...prev, [field]: error }));
      }
    },
    [validationSchema, validateOnChange]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (field: string) => () => {
      setTouchedState((prev) => ({ ...prev, [field]: true }));

      if (validateOnBlur) {
        const error = validateField(field);
        setErrorsState((prev) => ({ ...prev, [field]: error }));
      }
    },
    [validateField, validateOnBlur]
  );

  // Set field value programmatically
  const setFieldValue = useCallback(
    (field: string, value: any) => {
      const nextValues = { ...values, [field]: value };
      setValuesState(nextValues);

      if (validateOnChange) {
        const error = validationSchema[field]?.validate(value, nextValues);
        setErrorsState((prev) => ({ ...prev, [field]: error }));
      }
    },
    [validationSchema, validateOnChange]
  );

  // Set field error programmatically
  const setFieldError = useCallback((field: string, error: string | null | undefined) => {
    setErrorsState((prev) => ({ ...prev, [field]: error }));
  }, []);

  // Set field touched programmatically
  const setFieldTouched = useCallback((field: string, touched: boolean) => {
    setTouchedState((prev) => ({ ...prev, [field]: touched }));
  }, []);

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Set multiple errors
  const setErrors = useCallback((newErrors: Partial<FormErrors>) => {
    setErrorsState((prev) => ({ ...prev, ...newErrors }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched: TouchedFields = {};
      Object.keys(validationSchema).forEach((field) => {
        allTouched[field] = true;
      });
      setTouchedState(allTouched);

      setIsValidating(true);
      const formIsValid = validateForm();
      setIsValidating(false);

      if (!formIsValid) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validationSchema, validateForm, onSubmit, values]
  );

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Get field props (convenience method)
  const getFieldProps = useCallback(
    (field: string): FormField => {
      return {
        id: field,
        value: values[field] ?? '',
        onChange: handleChange(field),
        onBlur: handleBlur(field),
        error: errors[field] ?? null,
        touched: touched[field] ?? false,
      };
    },
    [values, errors, touched, handleChange, handleBlur]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isValidating,
    setIsSubmitting,
    handleSubmit,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    validateField,
    validateForm,
    getFieldProps,
    setValues,
    setErrors,
  };
}