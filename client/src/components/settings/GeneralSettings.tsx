"use client";

import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";

const timezones = [
  {
    key: "utc-5",
    value: "UTC -05:00",
  },
  {
    key: "utc",
    value: "UTC +00:00",
  },
  {
    key: "utc+1",
    value: "UTC +01:00",
  },
  {
    key: "utc+5:30",
    value: "UTC +05:30",
  },
];

const regions = [
  {
    key: "north-america",
    value: "North America",
  },
  {
    key: "europe",
    value: "Europe",
  },
  {
    key: "asia",
    value: "Asia",
  },
];

const currencies = [
  {
    key: "usd",
    value: "USD",
  },
  {
    key: "eur",
    value: "EUR",
  },
  {
    key: "inr",
    value: "INR",
  },
];

const units = [
  {
    key: "km",
    value: "Kilometers",
  },
  {
    key: "mi",
    value: "Miles",
  },
];

type GeneralSettingsFormData = {
  platformName: string;
  region: string;
  currency: string;
  distanceUnit: string;
  timezone: string;
};

export const GeneralSettings = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GeneralSettingsFormData>({
    defaultValues: {
      platformName: "TransitOps",
      region: "north-america",
      currency: "usd",
      distanceUnit: "km",
      timezone: "utc",
    },
  });

  const onSubmit = async (data: GeneralSettingsFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          General Settings
        </h2>

        <p className="mt-2 text-muted-foreground">
          Manage platform preferences and regional settings.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <Label htmlFor="platformName">Platform Name</Label>

          <Input
            id="platformName"
            placeholder="TransitOps"
            error={errors.platformName?.message}
            {...register("platformName")}
          />
        </div>

        <div>
          <Label>Default Region</Label>

          <Controller
            name="region"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                {...field}
                options={regions}
                placeholder="Select region"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <div>
          <Label>Currency</Label>

          <Controller
            name="currency"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                {...field}
                options={currencies}
                placeholder="Select currency"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <div>
          <Label>Distance Unit</Label>

          <Controller
            name="distanceUnit"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                {...field}
                options={units}
                placeholder="Select unit"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <div className="col-span-2">
          <Label>Time Zone</Label>

          <Controller
            name="timezone"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                {...field}
                options={timezones}
                placeholder="Select timezone"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
      </div>

      <div className="mt-auto flex justify-end pt-8">
        <Button type="submit" loading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};
