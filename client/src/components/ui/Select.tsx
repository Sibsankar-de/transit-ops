"use client";

import { SelectType } from "@/types/SelectType";
import { ChevronDown } from "lucide-react";
import {
  forwardRef,
  KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "../utils";
import { Dropdown } from "./Dropdown";

export const Select = forwardRef<HTMLButtonElement, SelectType>(
  (
    {
      id,
      name,
      placeholder,
      value,
      options = [],
      onChange,
      onBlur,
      disabled,
      className,
      dropdownClass,
      error,
    },
    ref,
  ) => {
    const uid = id || useId();
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(value ?? "");
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const normalized = options.map((option) =>
      typeof option === "string" ? { key: option, value: option } : option,
    );

    useEffect(() => {
      setSelected(value ?? "");
    }, [value]);

    useEffect(() => {
      const handleOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
          setIsFocused(false);
          onBlur?.();
        }
      };

      window.addEventListener("mousedown", handleOutside);

      return () => {
        window.removeEventListener("mousedown", handleOutside);
      };
    }, [onBlur]);

    function handleClick() {
      if (disabled) return;

      setOpen((prev) => !prev);
      setIsFocused((prev) => !prev);
    }

    function selectValue(val: string) {
      if (disabled) return;

      setSelected(val);
      onChange?.(val);
      onBlur?.();

      setOpen(false);
      setIsFocused(false);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
      if (disabled) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }

      if (e.key === "Escape") {
        setOpen(false);
        setIsFocused(false);
        onBlur?.();
      }
    }

    return (
      <div className="w-full">
        <div className="relative" ref={containerRef}>
          <button
            ref={ref}
            id={uid}
            name={name}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left text-foreground transition-all",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              isFocused && "ring-2 ring-ring",
              error && "border-red-500 focus:ring-red-500",
              disabled && "cursor-not-allowed opacity-60",
              className,
            )}
          >
            <span
              className={cn("truncate", !selected && "text-muted-foreground")}
            >
              {!selected
                ? placeholder
                : (normalized.find((o) => o.key === selected)?.value ??
                  selected)}
            </span>

            <ChevronDown
              size={16}
              className={cn(
                "shrink-0 text-muted-foreground transition-transform",
                isFocused && "rotate-180",
              )}
            />
          </button>

          {open && !disabled && (
            <Dropdown
              openState={open}
              onClose={() => {
                setOpen(false);
                setIsFocused(false);
                onBlur?.();
              }}
              className={cn(
                "mt-2 w-full overflow-auto rounded-lg border border-border bg-card",
                dropdownClass,
              )}
            >
              <ul role="listbox" aria-labelledby={uid}>
                {normalized.map((option) => (
                  <li
                    key={option.key}
                    role="option"
                    tabIndex={0}
                    aria-selected={selected === option.key}
                    className={cn(
                      "cursor-pointer rounded-md px-4 py-2 transition-colors",
                      "hover:bg-secondary",
                      selected === option.key &&
                        "bg-primary font-medium text-primary-foreground",
                    )}
                    onClick={() => selectValue(option.key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectValue(option.key);
                      }
                    }}
                  >
                    {option.value}
                  </li>
                ))}
              </ul>
            </Dropdown>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
