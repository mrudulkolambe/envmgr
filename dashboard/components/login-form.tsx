"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import { FormField } from "@/components/app/form/input";
import Button from "@/components/app/button";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";
import { ValidatorFactory } from "@/lib/utils/form/validatorfactory";
import Link from "next/link";
import { toast } from "sonner";
import LoginService from "@/app/(auth)/login/service/login.service";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

  const form = useValidatedForm({
    initialData: {
      email: '',
      password: '',
    },
    validators: {
      email: ValidatorFactory.required('Email is required').email(),
      password: ValidatorFactory.required('Password is required'),
    },
  });

  const loginService = new LoginService();

  const onSubmit = form.handleSubmit(async (values) => {
    await loginService.login(values, {
      onLoading: (loading) => form.setSubmitting(loading),
      onSuccess: (data) => {
        toast.success(`Welcome back, ${data.user.name}!`);
        router.push("/dashboard");
      },
      onError: (message) => {
        toast.error(message);
      },
    });
  });

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={onSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-start gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>

        <FormField
          id="email"
          label="Email"
          type="email"
          name="email"
          placeholder="m@example.com"
          required
          form={form}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••••••••••"
          required
          form={form}
          labelExtra={
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          }
        />

        <Button
          type="submit"
          loading={form.isSubmitting}
          className="w-full"
        >
          Login
        </Button>

        <FieldDescription className="text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline underline-offset-4">
            Sign up
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
