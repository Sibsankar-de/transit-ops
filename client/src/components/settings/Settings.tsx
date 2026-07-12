"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AccessPermissionSettings } from "./AccessPermissionSettings";
import { GeneralSettings } from "./GeneralSettings";
import { ProfileSettings } from "./ProfileSettings";

export type SettingsTab = "general" | "profile" | "access";

function SettingsContent() {
  const searchParams = useSearchParams();
  const active = (searchParams.get("tab") as SettingsTab) || "general";

  return (
    <div className="w-full rounded-xl border border-border bg-card p-6">
      {active === "general" && <GeneralSettings />}
      {active === "profile" && <ProfileSettings />}
      {active === "access" && <AccessPermissionSettings />}
    </div>
  );
}

export const Settings = () => {
  return (
    <Suspense fallback={<div className="w-full rounded-xl border border-border bg-card p-6 animate-pulse min-h-[200px]" />}>
      <SettingsContent />
    </Suspense>
  );
};

