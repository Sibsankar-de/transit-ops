"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export const tripSchema = z.object({
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  driverId: z.string().min(1, "Driver is required"),
  cargoWeight: z.number().positive("Cargo weight must be a positive number"),
  plannedDistance: z.number().positive("Planned distance must be a positive number"),
});

export type TripFormValues = z.infer<typeof tripSchema>;

interface TripFormProps {
  onSubmit: (data: TripFormValues) => void;
  onCancel: () => void;
  vehicles: { id: string; registration: string; make: string; model: string }[];
  drivers: { id: string; name: string }[];
  isSubmitting?: boolean;
}

export function TripForm({
  onSubmit,
  onCancel,
  vehicles,
  drivers,
  isSubmitting = false,
}: TripFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      source: "",
      destination: "",
      vehicleId: "",
      driverId: "",
      cargoWeight: undefined,
      plannedDistance: undefined,
    },
  });

  const selectedVehicle = watch("vehicleId");
  const selectedDriver = watch("driverId");

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

  const vehicleOptions = vehicles.map((v) => ({
    key: v.id,
    value: `${v.registration} - ${v.make} ${v.model}`,
  }));

  const driverOptions = drivers.map((d) => ({
    key: d.id,
    value: d.name,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="source" required>
            Source
          </Label>
          <Input
            id="source"
            placeholder="e.g. Nairobi ICD"
            isInvalid={!!errors.source}
            {...registerInput(register("source"))}
          />
          {errors.source && (
            <p className="text-red-500 text-xs mt-1">{errors.source.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="destination" required>
            Destination
          </Label>
          <Input
            id="destination"
            placeholder="e.g. Mombasa Port"
            isInvalid={!!errors.destination}
            {...registerInput(register("destination"))}
          />
          {errors.destination && (
            <p className="text-red-500 text-xs mt-1">
              {errors.destination.message}
            </p>
          )}
        </div>

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
          />
          {errors.vehicleId && (
            <p className="text-red-500 text-xs mt-1">
              {errors.vehicleId.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="driverId" required>
            Driver
          </Label>
          <Select
            placeholder="Select driver"
            value={selectedDriver}
            options={driverOptions}
            onChange={(val) =>
              setValue("driverId", val, { shouldValidate: true })
            }
          />
          {errors.driverId && (
            <p className="text-red-500 text-xs mt-1 text-left">
              {errors.driverId.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="cargoWeight" required>
            Cargo Weight (kg)
          </Label>
          <Input
            id="cargoWeight"
            type="number"
            placeholder="kg"
            isInvalid={!!errors.cargoWeight}
            {...registerInput(register("cargoWeight", { valueAsNumber: true }))}
          />
          {errors.cargoWeight && (
            <p className="text-red-500 text-xs mt-1">
              {errors.cargoWeight.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="plannedDistance" required>
            Planned Distance (km)
          </Label>
          <Input
            id="plannedDistance"
            type="number"
            placeholder="km"
            isInvalid={!!errors.plannedDistance}
            {...registerInput(
              register("plannedDistance", { valueAsNumber: true })
            )}
          />
          {errors.plannedDistance && (
            <p className="text-red-500 text-xs mt-1">
              {errors.plannedDistance.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={isSubmitting}>
          Create Trip
        </Button>
      </div>
    </form>
  );
}
