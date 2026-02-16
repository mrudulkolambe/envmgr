'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import Input from "@/components/app/form/Input"
import { useFormValidator } from "@/hooks/use-form-validator"
import { Validator } from "@/lib/db/validators/validator"
import Link from "next/link";
import { AuthService } from "@/app/(auth)/service/auth";
import { setToken } from "@/lib/token";
import { useRouter } from "next/navigation";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const authService = new AuthService();

  const form = useFormValidator({
    initialValues: {
      name: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: {
      name: Validator.string('Name').required().minLength(2),
      email: Validator.string('Email').email().required(),
      username: Validator.string('Username')
        .required()
        .minLength(3, 'Username must be at least 3 characters')
        .maxLength(20, 'Username must be at most 20 characters')
        .pattern(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
      password: Validator.string('Password')
        .password({ 
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumber: true,
        })
        .required(),
      confirmPassword: Validator.string('Confirm Password')
        .required()
        .matchField('password', 'Passwords must match'),
    },
    onSubmit: async (values) => {
      authService.signup(values, {
        onLoading: (isLoading) => form.setIsSubmitting(isLoading),
        onSuccess: (data) => {
          setToken(data.auth_token);
          router.push('/dashboard');
        },
        onError: (message, status) => {
          if (status === 409) {
            form.setFieldError('email', message);
          }else{}
        }
      });
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  return (
    <div className={cn("min-w-[30vw] flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit}>
            <FieldGroup>
              <Input
                label="Name"
                type="text"
                placeholder="John Doe"
                required
                autoComplete="name"
                {...form.getFieldProps('name')}
              />

              <Input
                label="Email"
                type="email"
                placeholder="m@example.com"
                required
                autoComplete="email"
                {...form.getFieldProps('email')}
              />

              <Input
                label="Username"
                type="text"
                placeholder="johndoe"
                required
                description="3-20 characters, letters, numbers, and underscores only"
                autoComplete="username"
                {...form.getFieldProps('username')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                required
                description="At least 8 characters with uppercase, lowercase, and number"
                autoComplete="new-password"
                {...form.getFieldProps('password')}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
                {...form.getFieldProps('confirmPassword')}
              />

              <Field>
                <Button 
                  type="submit" 
                  loading={form.isSubmitting}
                  disabled={!form.isValid || form.isSubmitting}
                  className="w-full"
                >
                  Sign up
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link href="/login" className="underline">Login</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}