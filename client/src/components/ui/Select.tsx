"use client";

import { SelectType } from "@/types/SelectType";
import { ChevronDown } from "lucide-react";
import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { cn } from "../utils";
import { Dropdown } from "./Dropdown";

export const Select = ({
  id,
  placeholder,
  value,
  options = [],
  onChange,
  disabled,
  className,
  dropdownClass,
}: SelectType) => {
  const uid = id || useId();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(value ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const normalized = options.map((o) =>
    typeof o === "string" ? { key: o, value: o } : o,
  );

  useEffect(() => {
    setSelected(value ?? "");
  }, [value]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setIsFocused(false);
      }
    };

    window.addEventListener("mousedown", handleOutside);

    return () => {
      window.removeEventListener("mousedown", handleOutside);
    };
  }, []);

  function handleClick() {
    if (disabled) return;
    setIsFocused((prev) => !prev);
    setOpen((prev) => !prev);
  }

  function selectValue(val: string) {
    if (disabled) return;
    setSelected(val);
    onChange?.(val);
    setOpen(false);
    setIsFocused(false);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (disabled) return;

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setOpen((prev) => !prev);
    } else if (e.key === "Escape") {
      setOpen(false);
      setIsFocused(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <div
        className={cn(
          "flex h-fit w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-foreground transition-all duration-200",
          "focus-within:ring-2 focus-within:ring-ring",
          isFocused && "ring-2 ring-ring",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
        onClick={handleClick}
        onKeyDown={onKeyDown}
      >
        <div
          id={uid}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="w-full select-none truncate bg-transparent outline-none"
        >
          <span className={cn(!selected && "text-muted-foreground")}>
            {!selected
              ? placeholder
              : (normalized.find((o) => o.key === selected)?.value ?? selected)}
          </span>
        </div>

        <div
          className={cn(
            "transition-transform duration-200",
            isFocused ? "rotate-180" : "rotate-0",
          )}
        >
          <ChevronDown size={16} className="text-muted-foreground" />
        </div>
      </div>

      {open && !disabled && (
        <Dropdown
          openState={open}
          onClose={() => {
            setOpen(false);
            setIsFocused(false);
          }}
          className={cn(
            "mt-2 w-full overflow-auto rounded-lg border border-border bg-card",
            dropdownClass,
          )}
        >
          <ul role="listbox" aria-labelledby={uid}>
            {normalized.map((opt) => (
              <li
                key={opt.key}
                role="option"
                aria-selected={selected === opt.key}
                tabIndex={0}
                className={cn(
                  "cursor-pointer rounded-md px-4 py-2 text-foreground transition-colors",
                  "hover:bg-secondary",
                  selected === opt.key &&
                    "bg-primary text-primary-foreground font-medium",
                )}
                onClick={() => selectValue(opt.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectValue(opt.key);
                  }
                }}
              >
                {opt.value}
              </li>
            ))}
          </ul>
        </Dropdown>
      )}
    </div>
  );
};
