"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";

const roles = [
  {
    key: "fleet-manager",
    value: "Fleet Manager",
  },
  {
    key: "dispatcher",
    value: "Dispatcher",
  },
  {
    key: "safety-officer",
    value: "Safety Officer",
  },
  {
    key: "financial-analyst",
    value: "Financial Analyst",
  },
];

type SignInFormData = {
  email: string;
  password: string;
  role: string;
};

export const SignInForm = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
      role: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
      <div>
        <Label htmlFor="email">Email address</Label>

        <Input
          id="email"
          type="email"
          placeholder="manager@transitops.io"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>

        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      <div>
        <Label>Role</Label>

        <Controller
          name="role"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              {...field}
              placeholder="Select role"
              options={roles}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        loading={isSubmitting}
        className="w-full justify-center py-3 text-base font-semibold"
      >
        Sign In
      </Button>
    </form>
  );
};
