"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Check, ChevronDown, Loader2, UserCircle2 } from "lucide-react";
import { cn } from "@/components/utils";
import { useGetUsersQuery } from "@/store/slices/usersApiSlice";
import { User } from "@/types/api";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

interface UserSearchComboboxProps {
  value: string;           // selected userId
  onChange: (userId: string) => void;
  error?: string;
  disabled?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "bg-pink-500/20 text-pink-400 border-pink-500/30",
];

function avatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export function UserSearchCombobox({
  value,
  onChange,
  error,
  disabled = false,
}: UserSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Debounce search input ──
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ── Fetch users from the server ──
  const { data: response, isFetching } = useGetUsersQuery(
    { search: debouncedSearch || undefined, limit: 20 },
    { skip: !open }
  );

  const users: User[] = response?.data?.docs ?? [];

  // ── Selected user label ──
  const selectedUser = users.find((u) => u.id === value);

  // ── Close on outside click ──
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleOutside);
    return () => window.removeEventListener("mousedown", handleOutside);
  }, []);

  // ── Focus input when opening ──
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [open]);

  const handleSelect = useCallback(
    (user: User) => {
      onChange(user.id);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <div className="w-full relative" ref={containerRef}>
      {/* ── Trigger button ── */}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left transition-all",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          open && "ring-2 ring-ring",
          error && "border-red-500 focus:ring-red-500",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        {value && selectedUser ? (
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0",
                avatarColor(users.indexOf(selectedUser))
              )}
            >
              {getInitials(selectedUser.name)}
            </span>
            <span className="truncate text-foreground font-medium text-sm">
              {selectedUser.name}
            </span>
            <span className="text-muted-foreground text-xs truncate hidden sm:block">
              — {selectedUser.email}
            </span>
          </div>
        ) : value ? (
          // value present but users not loaded yet (e.g. initial load)
          <span className="text-muted-foreground text-sm">Loading user…</span>
        ) : (
          <span className="text-muted-foreground text-sm flex items-center gap-2">
            <UserCircle2 size={16} />
            Select a user account
          </span>
        )}
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* ── Dropdown ── */}
      {open && !disabled && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full max-h-72 overflow-hidden rounded-lg border border-border bg-card shadow-xl",
            "flex flex-col"
          )}
          style={{ minWidth: containerRef.current?.offsetWidth }}
        >
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search size={14} className="shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {isFetching && (
              <Loader2 size={14} className="animate-spin text-muted-foreground shrink-0" />
            )}
          </div>

          {/* List */}
          <ul role="listbox" className="overflow-y-auto max-h-56 py-1">
            {users.length === 0 && !isFetching && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                No users found
              </li>
            )}
            {users.map((user, idx) => {
              const isSelected = user.id === value;
              return (
                <li
                  key={user.id}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onClick={() => handleSelect(user)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(user);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors select-none",
                    "hover:bg-secondary focus:bg-secondary focus:outline-none",
                    isSelected && "bg-primary/10"
                  )}
                >
                  {/* Avatar */}
                  <span
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0",
                      avatarColor(idx)
                    )}
                  >
                    {getInitials(user.name)}
                  </span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Check */}
                  {isSelected && (
                    <Check size={14} className="shrink-0 text-primary" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
