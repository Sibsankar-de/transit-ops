"use client";

import { useState } from "react";
import { AccessPermissionSettings } from "./AccessPermissionSettings";
import { GeneralSettings } from "./GeneralSettings";
import { ProfileSettings } from "./ProfileSettings";
import { SettingsSidebar } from "./SettingsSidebar";

export type SettingsTab = "general" | "profile" | "access";

export const Settings = () => {
  const [active, setActive] = useState<SettingsTab>("general");

  return (
    <div className="flex items-start gap-6">
      <SettingsSidebar active={active} onChange={setActive} />

      <div className="flex-1 rounded-xl border border-border bg-card p-6">
        {active === "general" && <GeneralSettings />}
        {active === "profile" && <ProfileSettings />}
        {active === "access" && <AccessPermissionSettings />}
      </div>
    </div>
  );
};
