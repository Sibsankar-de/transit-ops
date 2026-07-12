"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

type ProfileSettingsFormData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  jobTitle: string;
};

export const ProfileSettings = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSettingsFormData>({
    defaultValues: {
      fullName: "John Doe",
      email: "john.doe@transitops.com",
      phoneNumber: "+1 (555) 123-4567",
      jobTitle: "Fleet Manager",
    },
  });

  const onSubmit = async (data: ProfileSettingsFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Profile Settings
        </h2>

        <p className="mt-2 text-muted-foreground">
          Update your account information and profile details.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <Label htmlFor="fullName">Full Name</Label>

          <Input
            id="fullName"
            placeholder="John Doe"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>

          <Input
            id="email"
            type="email"
            placeholder="john.doe@transitops.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>

          <Input
            id="phoneNumber"
            placeholder="+1 (555) 123-4567"
            error={errors.phoneNumber?.message}
            {...register("phoneNumber")}
          />
        </div>

        <div>
          <Label htmlFor="jobTitle">Job Title</Label>

          <Input
            id="jobTitle"
            placeholder="Fleet Manager"
            error={errors.jobTitle?.message}
            {...register("jobTitle")}
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
