"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
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
] as const;

export function SideNav({ onMobileClose }: { onMobileClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const [settingsExpanded, setSettingsExpanded] = useState(() => pathname.startsWith("/settings"));

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
              onClick={onMobileClose}
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

        {/* Settings collapsible dropdown */}
        <div>
          <button
            onClick={() => {
              if (collapsed) {
                router.push("/settings?tab=general");
              } else {
                setSettingsExpanded((prev) => !prev);
              }
            }}
            title={collapsed ? "Settings" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm w-full text-left cursor-pointer",
              "transition-all duration-150",
              pathname === "/settings"
                ? "bg-primary/15 text-primary font-medium"
                : "text-secondary-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <span className="flex items-center justify-center p-1!">
              <Settings size={16} className="shrink-0" />
            </span>

            <span
              className={cn(
                "whitespace-nowrap transition-opacity duration-200 flex-1",
                collapsed ? "hidden" : "block",
              )}
            >
              Settings
            </span>

            {!collapsed && (
              <ChevronDown
                size={16}
                className={cn(
                  "transition-transform duration-200 shrink-0",
                  settingsExpanded && "rotate-180",
                )}
              />
            )}
          </button>

          {settingsExpanded && !collapsed && (
            <div className="flex flex-col gap-0.5 mt-0.5">
              {[
                { label: "General Settings", tab: "general", href: "/settings?tab=general" },
                { label: "Profile", tab: "profile", href: "/settings?tab=profile" },
                { label: "Role Access Control", tab: "access", href: "/settings?tab=access" },
              ].map((subItem) => {
                const isSubActive =
                  pathname === "/settings" &&
                  (subItem.tab === "general"
                    ? !tab || tab === "general"
                    : tab === subItem.tab);

                return (
                  <Link
                    key={subItem.tab}
                    href={subItem.href}
                    onClick={onMobileClose}
                    className={cn(
                      "flex items-center gap-3 pl-11 py-2 rounded-md text-xs font-medium transition-all duration-150",
                      isSubActive
                        ? "bg-primary/15 text-primary"
                        : "text-secondary-foreground/80 hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {subItem.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
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

