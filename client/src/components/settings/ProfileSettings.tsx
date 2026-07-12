"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Avatar } from "@/components/ui/AvatarUpload";

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
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSettingsFormData>({
    defaultValues: {
      fullName: "Marcus Reid",
      email: "john.doe@transitops.com",
      phoneNumber: "+1 (555) 123-4567",
      jobTitle: "Fleet Manager",
    },
  });

  useEffect(() => {
    const name = localStorage.getItem("user_name") || "Marcus Reid";
    const role = localStorage.getItem("user_role") || "Fleet Manager";
    setValue("fullName", name);
    setValue("jobTitle", role);
  }, [setValue]);

  const onSubmit = async (data: ProfileSettingsFormData) => {
    localStorage.setItem("user_name", data.fullName);
    localStorage.setItem("user_role", data.jobTitle);
    window.dispatchEvent(new Event("profile_updated"));
  };

  const watchedName = watch("fullName") || "";
  const watchedTitle = watch("jobTitle") || "";

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

      {/* Premium Preview Section */}
      <div className="mt-6 flex items-center gap-6 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 bg-gradient-to-r from-card to-secondary/30 relative overflow-hidden group">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/8" />
        
        <Avatar
          name={watchedName || "New Profile"}
          size="lg"
          className="ring-4 ring-primary/10 shadow-md shrink-0 transition-transform duration-300 group-hover:scale-105"
        />
        
        <div className="flex flex-col gap-1 z-10">
          <span className="text-xs font-semibold tracking-wider text-primary uppercase">Profile Preview</span>
          <h3 className="text-xl font-bold text-foreground tracking-tight transition-colors duration-200">
            {watchedName || "New Profile"}
          </h3>
          <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            {watchedTitle || "No Role Specified"}
          </p>
        </div>
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
