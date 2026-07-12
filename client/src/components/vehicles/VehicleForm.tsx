"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FleetStatus } from "@/enums/fleetStatus.enum";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export const vehicleSchema = z.object({
  registration: z.string().min(3, "Registration must be at least 3 characters"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  type: z.string().min(1, "Type is required"),
  capacity: z.number().positive("Capacity must be a positive number"),
  odometer: z.number().nonnegative("Odometer must be non-negative"),
  acqCost: z.number().nonnegative("Acquisition cost must be non-negative"),
  status: z.nativeEnum(FleetStatus),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  onSubmit: (data: VehicleFormValues) => void;
  onCancel: () => void;
  defaultValues?: Partial<VehicleFormValues>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const VEHICLE_TYPES = ["Truck", "Van", "Tanker"];
const STATUS_OPTIONS = Object.values(FleetStatus).map((status) => ({
  key: status,
  value: status.toLowerCase().replace(/_/g, " "),
}));

export function VehicleForm({
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting = false,
  submitLabel = "Save",
}: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      status: FleetStatus.AVAILABLE,
      ...defaultValues,
    },
  });

  const selectedType = watch("type");
  const selectedStatus = watch("status");

  // Helper to bridge react-hook-form register with our custom Input component
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
          <Label htmlFor="registration" required>
            Registration
          </Label>
          <Input
            id="registration"
            placeholder="e.g. KAA 201Z"
            error={errors.registration?.message}
            {...registerInput(register("registration"))}
          />
        </div>

        <div>
          <Label htmlFor="make" required>
            Make
          </Label>
          <Input
            id="make"
            placeholder="e.g. Isuzu"
            error={errors.make?.message}
            {...registerInput(register("make"))}
          />
        </div>

        <div>
          <Label htmlFor="model" required>
            Model
          </Label>
          <Input
            id="model"
            placeholder="e.g. FTR"
            error={errors.model?.message}
            {...registerInput(register("model"))}
          />
        </div>

        <div>
          <Label htmlFor="type" required>
            Type
          </Label>
          <Select
            placeholder="Select Type"
            value={selectedType}
            options={VEHICLE_TYPES}
            onChange={(val) => setValue("type", val, { shouldValidate: true })}
            error={errors.type?.message}
          />
        </div>

        <div>
          <Label htmlFor="capacity" required>
            Capacity (kg)
          </Label>
          <Input
            id="capacity"
            type="number"
            placeholder="e.g. 8000"
            error={errors.capacity?.message}
            {...registerInput(register("capacity", { valueAsNumber: true }))}
          />
        </div>

        <div>
          <Label htmlFor="odometer" required>
            Odometer (km)
          </Label>
          <Input
            id="odometer"
            type="number"
            placeholder="e.g. 98420"
            error={errors.odometer?.message}
            {...registerInput(register("odometer", { valueAsNumber: true }))}
          />
        </div>

        <div>
          <Label htmlFor="acqCost" required>
            Acquisition Cost (KES)
          </Label>
          <Input
            id="acqCost"
            type="number"
            placeholder="e.g. 4500000"
            error={errors.acqCost?.message}
            {...registerInput(register("acqCost", { valueAsNumber: true }))}
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
              setValue("status", val as FleetStatus, { shouldValidate: true })
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
