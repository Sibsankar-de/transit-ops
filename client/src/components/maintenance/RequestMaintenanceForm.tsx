"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export const requestSchema = z.object({
  vehicleId: z.string().uuid("vehicleId must be a valid UUID"),
  type: z.string().min(1, "Service type is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  date: z.string().min(1, "Scheduled date is required"),
  mechanic: z.string().optional(),
});

export type RequestFormValues = z.infer<typeof requestSchema>;

interface RequestMaintenanceFormProps {
  onSubmit: (data: RequestFormValues) => void;
  onCancel?: () => void;
  vehicles: { id: string; registration: string; make: string; model: string }[];
  isSubmitting?: boolean;
}

const SERVICE_TYPES = [
  "Engine Repair",
  "Tire Replacement",
  "Brake Service",
  "Oil Change",
  "General Service",
];

export function RequestMaintenanceForm({
  onSubmit,
  onCancel,
  vehicles,
  isSubmitting = false,
}: RequestMaintenanceFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      vehicleId: "",
      type: "",
      description: "",
      date: "",
      mechanic: "",
    },
  });

  const selectedVehicle = watch("vehicleId");
  const selectedType = watch("type");

  const registerInput = (registerField: any) => ({
    name: registerField.name,
    onBlur: registerField.onBlur,
    ref: registerField.ref,
    disabled: registerField.disabled,
    onChange: (val: string) => {
      registerField.onChange({
        target: {
          name: registerField.name,
          value: val,
        },
      });
    },
  });

  const vehicleOptions = vehicles.map((v) => ({
    key: v.id,
    value: `${v.registration} - ${v.make} ${v.model}`,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <div className="space-y-4">
        <div>
          <Label htmlFor="vehicleId" required>
            Vehicle
          </Label>
          <Select
            placeholder="Select vehicle"
            value={selectedVehicle}
            options={vehicleOptions}
            onChange={(val) =>
              setValue("vehicleId", val, { shouldValidate: true })
            }
            error={errors.vehicleId?.message}
          />
        </div>

        <div>
          <Label htmlFor="type" required>
            Service Type
          </Label>
          <Select
            placeholder="Select type"
            value={selectedType}
            options={SERVICE_TYPES}
            onChange={(val) => setValue("type", val, { shouldValidate: true })}
            error={errors.type?.message}
          />
        </div>

        <div>
          <Label htmlFor="description" required>
            Description
          </Label>
          <textarea
            id="description"
            rows={4}
            placeholder="Describe the issue or service needed..."
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date" required>
              Scheduled Date
            </Label>
            <Input
              id="date"
              type="date"
              error={errors.date?.message}
              {...registerInput(register("date"))}
            />
          </div>

          <div>
            <Label htmlFor="mechanic">Mechanic / Shop</Label>
            <Input
              id="mechanic"
              placeholder="Optional"
              error={errors.mechanic?.message}
              {...registerInput(register("mechanic"))}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" loading={isSubmitting}>
          Submit Request
        </Button>
      </div>
    </form>
  );
}
