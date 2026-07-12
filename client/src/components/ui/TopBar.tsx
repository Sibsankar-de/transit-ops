"use client";

import { usePathname } from "next/navigation";
import { SearchInput } from "./SearchInput";
import { UserProfile } from "./UserProfile";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":        "Dashboard",
  "/vehicle-registry": "Fleet",
  "/drivers":          "Drivers",
  "/trips":            "Trips",
  "/maintainance":     "Maintenance",
  "/fuel-and-expense": "Fuel & Expenses",
  "/analytics":        "Analytics",
  "/settings":         "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "TransitOps";

  return (
    <header className="flex items-center h-[var(--topnav-height)] px-6 gap-4 bg-card border-b border-border shrink-0">
      <h1 className="text-base font-bold text-foreground whitespace-nowrap w-40 shrink-0">
        {title}
      </h1>

      <div className="flex-1 max-w-md">
        <SearchInput placeholder="Search vehicles, drivers, trips..." />
      </div>

      <div className="ml-auto">
        <UserProfile />
      </div>
    </header>
  );
}
