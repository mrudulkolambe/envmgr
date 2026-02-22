'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field"
import Input from "@/components/app/form/Input"
import { useFormValidator } from "@/hooks/use-form-validator"
import Link from "next/link"
import { AuthService } from "@/app/(auth)/service/auth.service"
import { useRouter } from "next/navigation"
import { Validator } from "@/lib/validators/field"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const authService = new AuthService()

  const form = useFormValidator({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: {
      name: Validator.string('Name').required().minLength(2),
      email: Validator.string('Email').email().required(),
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
      authService.signup(
        { name: values.name, email: values.email, password: values.password, username: values.name },
        {
          onLoading: (isLoading) => form.setIsSubmitting(isLoading),
          onSuccess: () => {
            router.push('/login')
          },
          onError: (message, status) => {
            if (status === 409) {
              form.setFieldError('email', 'An account with this email already exists.')
            } else {
              form.setFieldError('email', message)
            }
          },
        }
      )
    },
    validateOnChange: true,
    validateOnBlur: true,
  })

  return (
    <div className={cn("min-w-[30vw] flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details below to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit}>
            <FieldGroup>
              <Input
                label="Full Name"
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
                label="Password"
                type="password"
                placeholder="Create a password"
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
                  Create account
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{' '}
                  <Link href="/login" className="underline hover:text-primary transition-colors">
                    Log in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}