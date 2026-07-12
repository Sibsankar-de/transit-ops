"use client";

import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
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

const status = [
  {
    key: "active",
    value: "Active",
  },
  {
    key: "inactive",
    value: "Inactive",
  },
];

const permissions = [
  "Manage Fleet",
  "Manage Drivers",
  "Dispatch Routes",
  "View Analytics",
  "Manage Maintenance",
  "Manage Expenses",
  "Manage Users",
  "System Settings",
];

type AccessPermissionFormData = {
  role: string;
  status: string;
  permissions: string[];
};

export const AccessPermissionSettings = () => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccessPermissionFormData>({
    defaultValues: {
      role: "fleet-manager",
      status: "active",
      permissions,
    },
  });

  const onSubmit = async (data: AccessPermissionFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Access & Permissions
        </h2>

        <p className="mt-2 text-muted-foreground">
          Manage user roles and account access.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <Label>User Role</Label>

          <Controller
            name="role"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                {...field}
                options={roles}
                placeholder="Select role"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <div>
          <Label>Account Status</Label>

          <Controller
            name="status"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                {...field}
                options={status}
                placeholder="Select status"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
      </div>

      <div className="mt-8">
        <Label>Permissions</Label>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {permissions.map((permission) => (
            <label
              key={permission}
              className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3"
            >
              <input
                type="checkbox"
                value={permission}
                {...register("permissions")}
                className="h-4 w-4 accent-primary"
              />

              <span className="text-foreground">{permission}</span>
            </label>
          ))}
        </div>

        {errors.permissions?.message && (
          <p className="mt-2 text-sm text-red-500">
            {errors.permissions.message}
          </p>
        )}
      </div>

      <div className="mt-auto flex justify-end pt-8">
        <Button type="submit" loading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};
