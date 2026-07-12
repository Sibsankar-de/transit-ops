"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  LayoutDashboard,
  Route,
  Settings,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "../utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Fleet", href: "/vehicle-registry", icon: Truck },
  { label: "Drivers", href: "/drivers", icon: Users },
  { label: "Trips", href: "/trips", icon: Route },
  { label: "Maintenance", href: "/maintainance", icon: Wrench },
  { label: "Fuel & Expenses", href: "/fuel-and-expense", icon: DollarSign },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export function SideNav() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
      }}
      className={cn(
        "flex flex-col h-full shrink-0 overflow-hidden",
        "bg-card border-r border-border",
        "transition-[width] duration-300 ease-in-out",
      )}
    >
      <div className="flex items-center gap-5 px-3 h-(--topnav-height) shrink-0">
        <div
          className={cn(
            "w-10 h-10 rounded-md shrink-0",
            "bg-primary flex items-center justify-center",
          )}
        >
          <Truck size={20} className="text-primary-foreground" />
        </div>
        <span
          className={cn(
            "font-semibold text-md tracking-wide whitespace-nowrap text-foreground",
            "transition-opacity duration-200",
            collapsed ? "opacity-0 pointer-events-none w-0" : "opacity-100",
          )}
        >
          TransitOps
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 px-2 flex-1 py-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm",
                "transition-all duration-150",
                active
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-secondary-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <span className="flex items-center justify-center p-1!">
                <Icon size={16} className="shrink-0" />
              </span>

              <span
                className={cn(
                  "whitespace-nowrap transition-opacity duration-200",
                  collapsed ? "hidden" : "block",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className={cn(
          "flex items-center gap-2 px-4 py-4 shrink-0",
          "border-t border-border",
          "text-muted-foreground hover:text-foreground",
          "transition-colors duration-150 cursor-pointer",
        )}
      >
        {collapsed ? (
          <ChevronRight size={15} className="shrink-0" />
        ) : (
          <>
            <ChevronLeft size={15} className="shrink-0" />
            <span className="whitespace-nowrap text-sm transition-opacity duration-200">
              Collapse
            </span>
          </>
        )}
      </button>
    </aside>
  );
}
