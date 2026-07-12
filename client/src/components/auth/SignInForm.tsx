"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useLoginMutation } from "@/store/slices/usersApiSlice";
import { useToast } from "../ui/Toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof loginSchema>;

export const SignInForm = () => {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const { error } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (typeof window !== "undefined" && localStorage.getItem("user_name")) {
      router.replace("/dashboard");
    }
  }, [router]);

  const onSubmit = async (data: SignInFormData) => {
    try {
      const response = await login({
        email: data.email,
        password: data.password,
      }).unwrap();

      if (response.success && response.data) {
        const user = response.data;
        localStorage.setItem("user_name", user.name);
        localStorage.setItem("user_role", user.role?.name || "Fleet Manager");
        localStorage.setItem("user_email", user.email);
        localStorage.setItem("user_id", user.id);

        // Notify other components (like UserProfile)
        window.dispatchEvent(new Event("profile_updated"));

        router.replace("/dashboard");
      }
    } catch (err: any) {
      error(err?.data?.message || "Invalid email or password");
    }
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
        loading={isLoading}
        className="w-full justify-center py-3 text-base font-semibold"
      >
        Sign In
      </Button>
    </form>
  );
};
