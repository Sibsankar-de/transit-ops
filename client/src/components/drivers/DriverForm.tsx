"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DriverStatus } from "@/enums/driverStatus.enum";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { UserSearchCombobox } from "@/components/drivers/UserSearchCombobox";

// ──────────────────────────────────────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────────────────────────────────────

/** Add mode — userId is required */
export const addDriverSchema = z.object({
  userId: z.string().uuid("Please select a valid user"),
  licenseNo: z.string().min(1, "License number is required"),
  category: z.string().min(1, "Category is required"),
  expiry: z.string().min(1, "Expiry date is required"),
  safetyScore: z
    .number()
    .min(0, "Safety score cannot be negative")
    .max(100, "Safety score cannot exceed 100"),
  status: z.nativeEnum(DriverStatus),
});

/** Edit mode — userId is not editable */
export const editDriverSchema = z.object({
  userId: z.string().optional(),
  licenseNo: z.string().min(1, "License number is required"),
  category: z.string().min(1, "Category is required"),
  expiry: z.string().min(1, "Expiry date is required"),
  safetyScore: z
    .number()
    .min(0, "Safety score cannot be negative")
    .max(100, "Safety score cannot exceed 100"),
  status: z.nativeEnum(DriverStatus),
});

/** Union type used by both modes */
export type DriverFormValues = {
  userId?: string;
  licenseNo: string;
  category: string;
  expiry: string;
  safetyScore: number;
  status: DriverStatus;
};

// ──────────────────────────────────────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────────────────────────────────────

interface DriverFormProps {
  onSubmit: (data: DriverFormValues) => void;
  onCancel: () => void;
  defaultValues?: Partial<DriverFormValues>;
  isSubmitting?: boolean;
  submitLabel?: string;
  /** When true (Add mode) a user selector is shown. When false (Edit mode) it is hidden. */
  showUserPicker?: boolean;
}

const CATEGORIES = ["A", "B", "C", "D", "E", "CE"];
const STATUS_OPTIONS = Object.values(DriverStatus).map((status) => ({
  key: status,
  value: status.toLowerCase().replace(/_/g, " "),
}));

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export function DriverForm({
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting = false,
  submitLabel = "Save",
  showUserPicker = false,
}: DriverFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(showUserPicker ? addDriverSchema : editDriverSchema) as any,
    defaultValues: {
      status: DriverStatus.AVAILABLE,
      safetyScore: 85,
      ...defaultValues,
    },
  });

  const selectedCategory = watch("category");
  const selectedStatus = watch("status");

  /** Adapter: our Input/Select components call onChange with a raw string value,
   *  but react-hook-form register() returns an onChange that expects a SyntheticEvent.
   *  This adapter bridges the gap. */
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

        {/* ── User Picker (Add mode only) ── */}
        {showUserPicker && (
          <div className="md:col-span-2">
            <Label required>Linked User Account</Label>
            <Controller
              name="userId"
              control={control}
              render={({ field }) => (
                <UserSearchCombobox
                  value={field.value ?? ""}
                  onChange={(userId) => field.onChange(userId)}
                  error={errors.userId?.message}
                />
              )}
            />
          </div>
        )}

        {/* ── License Number ── */}
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

        {/* ── License Category ── */}
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

        {/* ── Expiry Date ── */}
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

        {/* ── Safety Score ── */}
        <div>
          <Label htmlFor="safetyScore" required>
            Safety Score (0–100)
          </Label>
          <Input
            id="safetyScore"
            type="number"
            placeholder="e.g. 85"
            error={errors.safetyScore?.message}
            {...registerInput(register("safetyScore", { valueAsNumber: true }))}
          />
        </div>

        {/* ── Status ── */}
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
