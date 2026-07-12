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
  licenseNo: z.string().min(1, "License number is required"),
  category: z.string().min(1, "Category is required"),
  expiry: z.string().min(1, "Expiry date is required"),
  contact: z.string().min(5, "Contact details are required"),
  safetyScore: z
    .number()
    .min(0, "Safety score cannot be negative")
    .max(100, "Safety score cannot exceed 100"),
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
            error={errors.name?.message}
            {...registerInput(register("name"))}
          />
        </div>

        <div>
          <Label htmlFor="licenseNo" required>
            License No.
          </Label>
          <Input
            id="licenseNo"
            placeholder="e.g. DL-KE-04421"
            error={errors.licenseNo?.message}
            {...registerInput(register("licenseNo"))}
          />
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
            error={errors.category?.message}
          />
        </div>

        <div>
          <Label htmlFor="expiry" required>
            Expiry Date
          </Label>
          <Input
            id="expiry"
            type="date"
            error={errors.expiry?.message}
            {...registerInput(register("expiry"))}
          />
        </div>

        <div>
          <Label htmlFor="contact" required>
            Contact
          </Label>
          <Input
            id="contact"
            placeholder="e.g. +254 712 441 200"
            error={errors.contact?.message}
            {...registerInput(register("contact"))}
          />
        </div>

        <div>
          <Label htmlFor="safetyScore" required>
            Safety Score (0-100)
          </Label>
          <Input
            id="safetyScore"
            type="number"
            placeholder="e.g. 85"
            error={errors.safetyScore?.message}
            {...registerInput(register("safetyScore", { valueAsNumber: true }))}
          />
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
            error={errors.status?.message}
          />
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
