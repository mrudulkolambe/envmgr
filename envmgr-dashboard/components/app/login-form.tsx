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
import { Validator } from "@/lib/db/validators/validator";
import { useFormValidator } from "@/hooks/use-form-validator";
import Link from "next/link";
import { AuthService } from "@/app/(auth)/service/auth";
import { setToken } from "@/lib/token";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const authService = new AuthService();

  const form = useFormValidator({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: {
      email: Validator.string('Email').email().required(),
      password: Validator.string('Password').required(),
    },
    onSubmit: async (values) => {
      authService.login(values, {
        onLoading: (isLoading) => form.setIsSubmitting(isLoading),
        onSuccess: (data) => {
          setToken(data.auth_token);
          router.push('/dashboard');
        },
        onError: (message) => {
          form.setFieldError('email', message);
        }
      });
    },
  });

  return (
    <div className={cn("min-w-[30vw] flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit}>
            <FieldGroup>
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
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                {...form.getFieldProps('password')}
              />
              <div className="flex items-center justify-end">
                <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">Forgot password?</Link>
              </div>
              <Field>
                <Button
                  type="submit"
                  loading={form.isSubmitting}
                  disabled={!form.isValid || form.isSubmitting}
                  className="w-full"
                >
                  Login
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}