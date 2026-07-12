"use client";

import { usePathname } from "next/navigation";
import { SearchInput } from "./SearchInput";
import { UserProfile } from "./UserProfile";
import { Menu } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":        "Dashboard",
  "/vehicle-registry": "Fleet",
  "/drivers":          "Drivers",
  "/trips":            "Trips",
  "/maintainance":     "Maintenance",
  "/fuel-and-expense": "Fuel & Expenses",
  "/settings":         "Settings",
};

export function TopBar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "TransitOps";

  return (
    <header className="flex items-center h-[var(--topnav-height)] px-4 md:px-6 gap-4 bg-card border-b border-border shrink-0">
      <button
        onClick={onMenuToggle}
        className="p-2 -ml-2 text-muted-foreground hover:text-foreground md:hidden cursor-pointer rounded-lg hover:bg-secondary transition-colors"
        aria-label="Toggle navigation menu"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-base font-bold text-foreground whitespace-nowrap w-24 sm:w-40 shrink-0">
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
