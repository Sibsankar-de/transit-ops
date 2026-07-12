"use client";

import React, { forwardRef, useState } from "react";
import { Eye, EyeOff, OctagonAlert } from "lucide-react";
import { cn } from "../utils";

export interface InputType extends Omit<React.ComponentProps<"input">, "onChange"> {
  icon?: React.ReactElement;
  error?: string;
  isInvalid?: boolean;
  onChange?: any;
}

export const Input = forwardRef<HTMLInputElement, InputType>(
  (
    {
      className,
      id,
      placeholder,
      type = "text",
      disabled = false,
      icon,
      error,
      isInvalid,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const hasError = Boolean(error) || Boolean(isInvalid);

    return (
      <div className="w-full">
        <div className="group relative flex w-full items-center">
          {icon && (
            <div
              className={cn(
                "absolute left-3 flex items-center justify-center text-muted-foreground",
                "group-focus-within:text-primary",
              )}
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            type={isPassword && showPassword ? "text" : type}
            placeholder={placeholder}
            disabled={disabled}
            onWheel={(e) => e.currentTarget.blur()}
            className={cn(
              "w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground",
              "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring",
              icon && "pl-10",
              isPassword && "pr-10",
              hasError && "border-red-500 pr-10 focus:ring-red-500",
              disabled &&
                "cursor-not-allowed bg-secondary text-muted-foreground opacity-70",
              className,
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}

          {hasError && !isPassword && (
            <div className="absolute right-3">
              <OctagonAlert className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
