"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import Link from "next/link";

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

export const SignInForm = () => {
  return (
    <form className="mt-10 space-y-6">
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input id="email" type="email" placeholder="manager@transitops.io" />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
        />
      </div>

      <div>
        <Label>Role</Label>
        <Select
          placeholder="Select role"
          value="fleet-manager"
          options={roles}
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
        className="w-full justify-center py-3 text-base font-semibold"
      >
        Sign In
      </Button>
    </form>
  );
};
