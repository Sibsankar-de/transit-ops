"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { Dropdown } from "./Dropdown";
import { cn } from "../utils";
import { Avatar } from "./AvatarUpload";

interface UserProfileProps {
  name?: string;
  role?: string;
}

export function UserProfile({
  name: initialName = "Marcus Reid",
  role: initialRole = "Fleet Manager",
}: UserProfileProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string>(initialName);
  const [role, setRole] = useState<string>(initialRole);

  useEffect(() => {
    const updateProfile = () => {
      const savedName = localStorage.getItem("user_name");
      const savedRole = localStorage.getItem("user_role");
      setName(savedName || initialName);
      setRole(savedRole || initialRole);
    };

    updateProfile();

    window.addEventListener("profile_updated", updateProfile);
    window.addEventListener("storage", updateProfile);

    return () => {
      window.removeEventListener("profile_updated", updateProfile);
      window.removeEventListener("storage", updateProfile);
    };
  }, [initialName, initialRole]);

  return (
    <div className="flex items-center gap-1">
      <button
        className="relative p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
      </button>

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 hover:bg-secondary rounded-lg px-2 py-1.5 transition-colors"
        >
          <Avatar name={name} size="sm" />
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-none">
              {name}
            </p>
            <p className="text-xs text-primary mt-0.5">{role}</p>
          </div>
          <ChevronDown
            size={14}
            className={cn(
              "text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>

        <Dropdown
          openState={open}
          onClose={() => setOpen(false)}
          className="right-0 top-[calc(100%+6px)] w-48"
        >
          <Link href="/settings" onClick={() => setOpen(false)}>
            <DropdownItem icon={<User size={14} />} label="Profile" />
          </Link>
          <Link href="/settings" onClick={() => setOpen(false)}>
            <DropdownItem icon={<Settings size={14} />} label="Settings" />
          </Link>
          <div className="my-1 border-t border-border" />
          <DropdownItem
            icon={<LogOut size={14} />}
            label="Sign out"
            danger
          />
        </Dropdown>
      </div>
    </div>
  );
}

function DropdownItem({
  icon,
  label,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors cursor-pointer",
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-foreground hover:bg-secondary"
      )}
    >
      {icon}
      {label}
    </div>
  );
}
