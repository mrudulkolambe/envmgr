type ValidationRule = (value: any, values: any) => string | null;

export class FieldValidator {
  private rules: ValidationRule[] = [];
  private fieldLabel: string = '';

  constructor(label?: string) {
    this.fieldLabel = label || 'Field';
  }

  string() {
    this.rules.push((value: any) => {
      if (value !== undefined && value !== null && typeof value !== 'string') {
        return `${this.fieldLabel} must be a string`;
      }
      return null;
    });
    return this;
  }

  number() {
    this.rules.push((value: any) => {
      if (value !== undefined && value !== null && typeof value !== 'number' && isNaN(Number(value))) {
        return `${this.fieldLabel} must be a number`;
      }
      return null;
    });
    return this;
  }

  required(message?: string) {
    this.rules.push((value: any) => {
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        return message || `${this.fieldLabel} is required`;
      }
      return null;
    });
    return this;
  }

  email(message?: string) {
    this.rules.push((value: any) => {
      if (!value) return null; 
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return message || `${this.fieldLabel} must be a valid email`;
      }
      return null;
    });
    return this;
  }

  password(options?: { minLength?: number; requireUppercase?: boolean; requireLowercase?: boolean; requireNumber?: boolean; requireSpecial?: boolean }) {
    const opts = {
      minLength: options?.minLength || 8,
      requireUppercase: options?.requireUppercase ?? true,
      requireLowercase: options?.requireLowercase ?? true,
      requireNumber: options?.requireNumber ?? true,
      requireSpecial: options?.requireSpecial ?? false,
    };

    this.rules.push((value: any) => {
      if (!value) return null;

      if (value.length < opts.minLength) {
        return `${this.fieldLabel} must be at least ${opts.minLength} characters`;
      }

      if (opts.requireUppercase && !/[A-Z]/.test(value)) {
        return `${this.fieldLabel} must contain at least one uppercase letter`;
      }

      if (opts.requireLowercase && !/[a-z]/.test(value)) {
        return `${this.fieldLabel} must contain at least one lowercase letter`;
      }

      if (opts.requireNumber && !/\d/.test(value)) {
        return `${this.fieldLabel} must contain at least one number`;
      }

      if (opts.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        return `${this.fieldLabel} must contain at least one special character`;
      }

      return null;
    });
    return this;
  }

  minLength(length: number, message?: string) {
    this.rules.push((value: any) => {
      if (!value) return null;
      if (value.length < length) {
        return message || `${this.fieldLabel} must be at least ${length} characters`;
      }
      return null;
    });
    return this;
  }

  maxLength(length: number, message?: string) {
    this.rules.push((value: any) => {
      if (!value) return null;
      if (value.length > length) {
        return message || `${this.fieldLabel} must be at most ${length} characters`;
      }
      return null;
    });
    return this;
  }

  min(minValue: number, message?: string) {
    this.rules.push((value: any) => {
      if (value === undefined || value === null || value === '') return null;
      const numValue = Number(value);
      if (numValue < minValue) {
        return message || `${this.fieldLabel} must be at least ${minValue}`;
      }
      return null;
    });
    return this;
  }

  max(maxValue: number, message?: string) {
    this.rules.push((value: any) => {
      if (value === undefined || value === null || value === '') return null;
      const numValue = Number(value);
      if (numValue > maxValue) {
        return message || `${this.fieldLabel} must be at most ${maxValue}`;
      }
      return null;
    });
    return this;
  }

  pattern(regex: RegExp, message?: string) {
    this.rules.push((value: any) => {
      if (!value) return null;
      if (!regex.test(value)) {
        return message || `${this.fieldLabel} format is invalid`;
      }
      return null;
    });
    return this;
  }

  match(getOtherValue: () => any, message?: string) {
    this.rules.push((value: any) => {
      const otherValue = getOtherValue();
      if (value !== otherValue) {
        return message || `${this.fieldLabel} must match`;
      }
      return null;
    });
    return this;
  }

  matchField(fieldName: string, message?: string) {
    this.rules.push((value: any, values: any) => {
      if (!values) return null;
      const otherValue = values[fieldName];
      if (value !== otherValue) {
        return message || `${this.fieldLabel} must match`;
      }
      return null;
    });
    return this;
  }

  oneOf(values: any[], message?: string) {
    this.rules.push((value: any) => {
      if (!value) return null;
      if (!values.includes(value)) {
        return message || `${this.fieldLabel} must be one of: ${values.join(', ')}`;
      }
      return null;
    });
    return this;
  }

  url(message?: string) {
    this.rules.push((value: any) => {
      if (!value) return null;
      try {
        new URL(value);
        return null;
      } catch {
        return message || `${this.fieldLabel} must be a valid URL`;
      }
    });
    return this;
  }

  custom(validator: (value: any, values: any) => string | null) {
    this.rules.push(validator);
    return this;
  }

  validate(value: any, values: any = {}): string | null {
    for (const rule of this.rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return null;
  }
}

export class Validator {
  static string(label?: string) {
    return new FieldValidator(label).string();
  }

  static number(label?: string) {
    return new FieldValidator(label).number();
  }

  static field(label?: string) {
    return new FieldValidator(label);
  }
}