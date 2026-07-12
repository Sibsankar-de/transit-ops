"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/components/utils";
import { SettingsTab } from "./Settings";

type SettingsSidebarProps = {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
};

const items: {
  key: SettingsTab;
  label: string;
}[] = [
  {
    key: "general",
    label: "General",
  },
  {
    key: "profile",
    label: "Profile",
  },
  {
    key: "access",
    label: "Access & Permissions",
  },
];

export const SettingsSidebar = ({ active, onChange }: SettingsSidebarProps) => {
  return (
    <div className="w-72 rounded-xl border border-border bg-card p-3">
      <div className="space-y-2">
        {items.map((item) => (
          <Button
            key={item.key}
            variant="none"
            onClick={() => onChange(item.key)}
            className={cn(
              "w-full justify-start rounded-lg px-4 py-3 text-left font-medium",
              active === item.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
