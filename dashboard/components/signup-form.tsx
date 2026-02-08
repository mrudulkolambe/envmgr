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
import SignupService from "@/app/(auth)/signup/service/signup.service";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const signupService = new SignupService();

  const form = useValidatedForm({
    initialData: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      name: ValidatorFactory.required('Name is required'),
      email: ValidatorFactory.required('Email is required').email(),
      password: ValidatorFactory.required('Password is required').password(8),
      confirmPassword: ValidatorFactory.required('Please confirm your password'),
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (values.password !== values.confirmPassword) {
      form.setError('confirmPassword', 'Passwords do not match');
      return;
    }

    await signupService.signup({
      name: values.name,
      email: values.email,
      password: values.password
    }, {
      onLoading: (loading) => form.setSubmitting(loading),
      onSuccess: (data) => {
        toast.success("Account created successfully! Please login.");
        router.push("/login");
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
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your details below to create your account
          </p>
        </div>

        <FormField
          id="name"
          label="Full Name"
          type="text"
          name="name"
          placeholder="John Doe"
          required
          form={form}
        />

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
        />

        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="••••••••••••••••"
          required
          form={form}
        />

        <Button
          type="submit"
          loading={form.isSubmitting}
          className="w-full"
        >
          Create Account
        </Button>
        
        <FieldDescription className="text-center">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Login
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
