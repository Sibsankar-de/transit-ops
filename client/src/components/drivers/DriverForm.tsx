"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DriverStatus } from "@/enums/driverStatus.enum";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export const driverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  licenseNo: z.string().min(3, "License number is required"),
  category: z.string().min(1, "Category is required"),
  expiry: z.string().min(1, "Expiry date is required"),
  contact: z.string().min(5, "Contact details are required"),
  safetyScore: z.number().min(0).max(100, "Safety score must be between 0 and 100"),
  status: z.nativeEnum(DriverStatus),
});

export type DriverFormValues = z.infer<typeof driverSchema>;

interface DriverFormProps {
  onSubmit: (data: DriverFormValues) => void;
  onCancel: () => void;
  defaultValues?: Partial<DriverFormValues>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const CATEGORIES = ["A", "B", "C", "D", "E", "CE"];
const STATUS_OPTIONS = Object.values(DriverStatus).map((status) => ({
  key: status,
  value: status.toLowerCase().replace(/_/g, " "),
}));

export function DriverForm({
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting = false,
  submitLabel = "Save",
}: DriverFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      status: DriverStatus.AVAILABLE,
      safetyScore: 85,
      ...defaultValues,
    },
  });

  const selectedCategory = watch("category");
  const selectedStatus = watch("status");

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
          valueAsNumber: val === "" ? NaN : Number(val),
        },
      });
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" required>
            Name
          </Label>
          <Input
            id="name"
            placeholder="e.g. Felix Mutua"
            isInvalid={!!errors.name}
            {...registerInput(register("name"))}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="licenseNo" required>
            License No.
          </Label>
          <Input
            id="licenseNo"
            placeholder="e.g. DL-KE-04421"
            isInvalid={!!errors.licenseNo}
            {...registerInput(register("licenseNo"))}
          />
          {errors.licenseNo && (
            <p className="text-red-500 text-xs mt-1">
              {errors.licenseNo.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="category" required>
            Category
          </Label>
          <Select
            placeholder="Select Category"
            value={selectedCategory}
            options={CATEGORIES}
            onChange={(val) =>
              setValue("category", val, { shouldValidate: true })
            }
          />
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="expiry" required>
            Expiry Date
          </Label>
          <Input
            id="expiry"
            type="date"
            isInvalid={!!errors.expiry}
            {...registerInput(register("expiry"))}
          />
          {errors.expiry && (
            <p className="text-red-500 text-xs mt-1">{errors.expiry.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="contact" required>
            Contact
          </Label>
          <Input
            id="contact"
            placeholder="e.g. +254 712 441 200"
            isInvalid={!!errors.contact}
            {...registerInput(register("contact"))}
          />
          {errors.contact && (
            <p className="text-red-500 text-xs mt-1">{errors.contact.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="safetyScore" required>
            Safety Score (0-100)
          </Label>
          <Input
            id="safetyScore"
            type="number"
            placeholder="e.g. 85"
            isInvalid={!!errors.safetyScore}
            {...registerInput(register("safetyScore", { valueAsNumber: true }))}
          />
          {errors.safetyScore && (
            <p className="text-red-500 text-xs mt-1">
              {errors.safetyScore.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="status" required>
            Status
          </Label>
          <Select
            placeholder="Select Status"
            value={selectedStatus}
            options={STATUS_OPTIONS}
            onChange={(val) =>
              setValue("status", val as DriverStatus, { shouldValidate: true })
            }
          />
          {errors.status && (
            <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
