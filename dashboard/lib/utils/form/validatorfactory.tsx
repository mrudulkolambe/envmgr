export type ValidatorFunction = (value: string) => string | null;

export class Validator {
    private validators: ValidatorFunction[] = [];
    private isRequiredField: boolean = false;

    // Email validation
    email(): this {
        this.validators.push((value: string) => {
            if (!value && !this.isRequiredField) return null;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value) ? null : 'Please enter a valid email address';
        });
        return this;
    }

    // Password validation
    password(minLength: number = 8): this {
        this.validators.push((value: string) => {
            if (!value && !this.isRequiredField) return null;
            if (value.length < minLength) return `Password must be at least ${minLength} characters`;
            if (!/[a-zA-Z]/.test(value)) return 'Password must contain at least one letter';
            if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
            return null;
        });
        return this;
    }

    // Min length validation
    minLength(length: number): this {
        this.validators.push((value: string) => {
            if (!value && !this.isRequiredField) return null;
            return value.length >= length ? null : `Must be at least ${length} characters`;
        });
        return this;
    }

    // Max length validation
    maxLength(length: number): this {
        this.validators.push((value: string) => {
            if (!value && !this.isRequiredField) return null;
            return value.length <= length ? null : `Must be at most ${length} characters`;
        });
        return this;
    }

    // Pattern validation
    pattern(regex: RegExp, message: string): this {
        this.validators.push((value: string) => {
            if (!value && !this.isRequiredField) return null;
            return regex.test(value) ? null : message;
        });
        return this;
    }

    // Phone validation
    phone(): this {
        this.validators.push((value: string) => {
            if (!value && !this.isRequiredField) return null;
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10
                ? null
                : 'Please enter a valid phone number';
        });
        return this;
    }

    // URL validation
    url(): this {
        this.validators.push((value: string) => {
            if (!value && !this.isRequiredField) return null;
            try {
                new URL(value);
                return null;
            } catch {
                return 'Please enter a valid URL';
            }
        });
        return this;
    }

    // Number validation
    number(): this {
        this.validators.push((value: string) => {
            if (!value && !this.isRequiredField) return null;
            return !isNaN(Number(value)) ? null : 'Please enter a valid number';
        });
        return this;
    }

    // Min value validation
    min(minValue: number): this {
        this.validators.push((value: string) => {
            if (!value && !this.isRequiredField) return null;
            const num = Number(value);
            return !isNaN(num) && num >= minValue ? null : `Must be at least ${minValue}`;
        });
        return this;
    }

    // Max value validation
    max(maxValue: number): this {
        this.validators.push((value: string) => {
            if (!value && !this.isRequiredField) return null;
            const num = Number(value);
            return !isNaN(num) && num <= maxValue ? null : `Must be at most ${maxValue}`;
        });
        return this;
    }

    // Required validation
    setRequired(required: boolean = true, message: string = 'This field is required'): this {
        this.isRequiredField = required;
        if (required) {
            // Add required validator at the beginning
            this.validators.unshift((value: string) => {
                return value && value.trim() !== '' ? null : message;
            });
        }
        return this;
    }

    // Custom validator
    custom(validator: ValidatorFunction): this {
        this.validators.push(validator);
        return this;
    }

    // Build the final validator function
    build(): ValidatorFunction {
        return (value: string): string | null => {
            for (const validator of this.validators) {
                const error = validator(value);
                if (error) return error;
            }
            return null;
        };
    }
}

export class ValidatorFactory {
    static email(): Validator {
        return new Validator().email();
    }

    static password(minLength?: number): Validator {
        return new Validator().password(minLength);
    }

    static minLength(length: number): Validator {
        return new Validator().minLength(length);
    }

    static maxLength(length: number): Validator {
        return new Validator().maxLength(length);
    }

    static pattern(regex: RegExp, message: string): Validator {
        return new Validator().pattern(regex, message);
    }

    static phone(): Validator {
        return new Validator().phone();
    }

    static url(): Validator {
        return new Validator().url();
    }

    static number(): Validator {
        return new Validator().number();
    }

    static min(minValue: number): Validator {
        return new Validator().min(minValue);
    }

    static max(maxValue: number): Validator {
        return new Validator().max(maxValue);
    }

    static required(message?: string): Validator {
        return new Validator().setRequired(true, message);
    }

    static custom(validator: ValidatorFunction): Validator {
        return new Validator().custom(validator);
    }
}
